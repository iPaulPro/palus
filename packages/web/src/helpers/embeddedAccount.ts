import type {
  Address,
  Chain,
  Hex,
  PrivateKeyAccount,
  Transport,
  WalletClient
} from "viem";
import { createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { CHAIN, RPC_URL } from "@/data/constants";

// IndexedDB constants
const DB_NAME = "palus-embedded";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const RECORD_KEY = "embedded-pk";

// Encryption constants
const PBKDF2_ITERATIONS = 600_000;
const AES_KEY_LENGTH = 256;
const IV_BYTE_LENGTH = 12;
const SALT_BYTE_LENGTH = 32;

interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

// In-memory cache to avoid repeated IndexedDB reads and decryption
let cachedClient: WalletClient<Transport, Chain, PrivateKeyAccount> | null =
  null;

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const dbGet = async <T>(key: string): Promise<T | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
};

const dbSet = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const dbDelete = async (key: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// ---------------------------------------------------------------------------
// Encryption helpers (AES-256-GCM with PBKDF2-derived key from user PIN)
// ---------------------------------------------------------------------------

const toBase64 = (buffer: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

const toBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.byteLength === bytes.byteLength
    ? (bytes.buffer as ArrayBuffer)
    : bytes.slice().buffer;

const deriveKey = async (pin: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      name: "PBKDF2",
      salt: toBuffer(salt)
    },
    keyMaterial,
    { length: AES_KEY_LENGTH, name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
};

const encrypt = async (
  plaintext: string,
  pin: string
): Promise<EncryptedPayload> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));
  const key = await deriveKey(pin, salt);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { iv: toBuffer(iv), name: "AES-GCM" },
    key,
    encoded
  );

  return {
    ciphertext: toBase64(ciphertext),
    iv: toBase64(toBuffer(iv)),
    salt: toBase64(toBuffer(salt))
  };
};

const decrypt = async (
  payload: EncryptedPayload,
  pin: string
): Promise<string> => {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.ciphertext);
  const key = await deriveKey(pin, salt);
  const decrypted = await crypto.subtle.decrypt(
    { iv: toBuffer(iv), name: "AES-GCM" },
    key,
    toBuffer(ciphertext)
  );

  return new TextDecoder().decode(decrypted);
};

// ---------------------------------------------------------------------------
// Internal: build wallet client from a raw private key
// ---------------------------------------------------------------------------

const buildWalletClient = (
  privateKey: Hex
): WalletClient<Transport, Chain, PrivateKeyAccount> => {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: CHAIN,
    transport: http(RPC_URL)
  });
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a new random private key, encrypt it with the user's PIN, and
 * persist it in IndexedDB.  Returns the address of the newly created account.
 */
const generateAndStoreEmbeddedAccount = async (
  pin: string
): Promise<Address> => {
  const privateKey = generatePrivateKey();
  const encrypted = await encrypt(privateKey, pin);
  await dbSet<EncryptedPayload>(RECORD_KEY, encrypted);
  cachedClient = buildWalletClient(privateKey);
  return privateKeyToAccount(privateKey).address;
};

/**
 * Retrieve the embedded wallet client.  Returns the cached client if already
 * unlocked this session, otherwise decrypts the stored key using the provided
 * PIN.  Returns `null` if no embedded account exists.
 *
 * @param pin - Required on the first call per session; ignored when cached.
 * @throws {Error} If no PIN is provided and the client is not cached.
 * @throws {DOMException} If the PIN is incorrect (AES-GCM decryption fails).
 */
const getEmbeddedWalletClient = async (
  pin?: string
): Promise<WalletClient<Transport, Chain, PrivateKeyAccount> | null> => {
  if (cachedClient) {
    return cachedClient;
  }

  const encrypted = await dbGet<EncryptedPayload>(RECORD_KEY);
  if (!encrypted) {
    return null;
  }

  if (!pin) {
    throw new Error("PIN is required to unlock the embedded account");
  }

  const privateKey = (await decrypt(encrypted, pin)) as Hex;
  cachedClient = buildWalletClient(privateKey);
  return cachedClient;
};

/**
 * Check whether the embedded wallet client is already unlocked (cached) for
 * this session, meaning no PIN entry is needed.
 */
const isEmbeddedAccountUnlocked = (): boolean => cachedClient !== null;

/**
 * Check whether an embedded account has been generated and stored.
 */
const hasEmbeddedAccount = async (): Promise<boolean> => {
  const payload = await dbGet<EncryptedPayload>(RECORD_KEY);
  return payload !== undefined;
};

/**
 * Return the address of the stored embedded account without building a full
 * wallet client.  Uses the cache when available; otherwise requires a PIN.
 *
 * @param pin - Required if the client is not cached; ignored when cached.
 * @throws {Error} If no PIN is provided and the client is not cached.
 * @throws {DOMException} If the PIN is incorrect.
 */
const getEmbeddedAccountAddress = async (
  pin?: string
): Promise<Address | null> => {
  if (cachedClient) {
    return cachedClient.account.address;
  }

  const encrypted = await dbGet<EncryptedPayload>(RECORD_KEY);
  if (!encrypted) {
    return null;
  }

  if (!pin) {
    throw new Error("PIN is required to unlock the embedded account");
  }

  const privateKey = (await decrypt(encrypted, pin)) as Hex;
  return privateKeyToAccount(privateKey).address;
};

/**
 * Re-encrypt the stored private key with a new PIN.  Requires the current PIN
 * to decrypt first (unless the client is already cached).
 *
 * @throws {Error} If no embedded account exists.
 * @throws {DOMException} If the current PIN is incorrect.
 */
const changeEmbeddedAccountPin = async (
  currentPin: string,
  newPin: string
): Promise<void> => {
  const encrypted = await dbGet<EncryptedPayload>(RECORD_KEY);
  if (!encrypted) {
    throw new Error("No embedded account exists");
  }

  const privateKey = (await decrypt(encrypted, currentPin)) as Hex;
  const reEncrypted = await encrypt(privateKey, newPin);
  await dbSet<EncryptedPayload>(RECORD_KEY, reEncrypted);
};

/**
 * Remove the embedded account from IndexedDB and clear the in-memory cache.
 */
const removeEmbeddedAccount = async (): Promise<void> => {
  await dbDelete(RECORD_KEY);
  cachedClient = null;
};

export {
  changeEmbeddedAccountPin,
  generateAndStoreEmbeddedAccount,
  getEmbeddedAccountAddress,
  getEmbeddedWalletClient,
  hasEmbeddedAccount,
  isEmbeddedAccountUnlocked,
  removeEmbeddedAccount
};

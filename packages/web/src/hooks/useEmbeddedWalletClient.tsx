import { useCallback, useEffect, useState } from "react";
import type {
  Address,
  Chain,
  PrivateKeyAccount,
  Transport,
  WalletClient
} from "viem";
import {
  generateAndStoreEmbeddedAccount,
  getEmbeddedAccountAddress,
  getEmbeddedWalletClient,
  hasEmbeddedAccount,
  isEmbeddedAccountUnlocked,
  removeEmbeddedAccount
} from "@/helpers/embeddedAccount";

export enum EmbeddedWalletError {
  AccountAlreadyExists = "AccountAlreadyExists",
  IncorrectPin = "IncorrectPin",
  NoAccountFound = "NoAccountFound",
  PinRequired = "PinRequired",
  Unknown = "Unknown"
}

interface UseEmbeddedWalletClientReturn {
  address: Address | null;
  create: (pin: string) => Promise<Address>;
  data: WalletClient<Transport, Chain, PrivateKeyAccount> | null;
  error: EmbeddedWalletError | null;
  loading: boolean;
  remove: () => Promise<void>;
  unlock: (pin: string) => Promise<void>;
}

const classifyError = (error: unknown): EmbeddedWalletError => {
  if (error instanceof Error) {
    if (error.message.includes("PIN is required")) {
      return EmbeddedWalletError.PinRequired;
    }
    if (error.message.includes("No embedded account")) {
      return EmbeddedWalletError.NoAccountFound;
    }
  }

  if (error instanceof DOMException) {
    return EmbeddedWalletError.IncorrectPin;
  }

  return EmbeddedWalletError.Unknown;
};

const useEmbeddedWalletClient = (): UseEmbeddedWalletClientReturn => {
  const [data, setData] = useState<WalletClient<
    Transport,
    Chain,
    PrivateKeyAccount
  > | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EmbeddedWalletError | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const exists = await hasEmbeddedAccount();
        if (!exists) {
          setData(null);
          setAddress(null);
          setError(null);
          setLoading(false);
          return;
        }

        if (isEmbeddedAccountUnlocked()) {
          const client = await getEmbeddedWalletClient();
          if (!cancelled) {
            setData(client);
            setAddress(client?.account.address ?? null);
            setError(null);
          }
        } else {
          const addr = await getEmbeddedAccountAddress().catch(() => null);
          if (!cancelled) {
            setAddress(addr);
            setError(EmbeddedWalletError.PinRequired);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(classifyError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const unlock = useCallback(async (pin: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const client = await getEmbeddedWalletClient(pin);
      if (!client) {
        setError(EmbeddedWalletError.NoAccountFound);
        return;
      }
      setData(client);
      setAddress(client.account.address);
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (createPin: string): Promise<Address> => {
    const exists = await hasEmbeddedAccount();
    if (exists) {
      setError(EmbeddedWalletError.AccountAlreadyExists);
      throw new Error(EmbeddedWalletError.AccountAlreadyExists);
    }

    setLoading(true);
    setError(null);

    try {
      const newAddress = await generateAndStoreEmbeddedAccount(createPin);
      const client = await getEmbeddedWalletClient(createPin);
      setData(client);
      setAddress(newAddress);
      return newAddress;
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await removeEmbeddedAccount();
      setData(null);
      setAddress(null);
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { address, create, data, error, loading, remove, unlock };
};

export default useEmbeddedWalletClient;

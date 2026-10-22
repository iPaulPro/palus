import { chains } from "@lens-chain/sdk/viem";
import { NATIVE_TOKEN } from "@/data/tokens";

export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";
export const CHAIN = IS_TESTNET ? chains.testnet : chains.mainnet;

// Lens and Palus Env Config
export const PALUS_TREASURY = IS_TESTNET
  ? "0xdaA5EBe0d75cD16558baE6145644EDdFcbA1e868"
  : "0x8589d6dd8acc2c41b7ac8b247458fda18d4c20ae";
export const ADDRESS_PLACEHOLDER = "0x03B…a7EF";
export const ADMIN_GROUP_ADDRESS = IS_TESTNET
  ? "0x7e4A751818969f8ba35b56B0D726FB8A5A7FA84b"
  : "0x3B12d0255Fe501307D3616F2CFc95398FF11e5E9";
export const PLATFORM_COLLECT_FEE = 2; // 2%

// Application
export const BRAND_COLOR = "#0170a3";

// Media URLs
export const STATIC_IMAGES_URL = "/images";
export const LENS_MEDIA_SNAPSHOT_URL = "https://ik.imagekit.io/lens";
export const DEFAULT_AVATAR = `${STATIC_IMAGES_URL}/default.webp`;
export const PLACEHOLDER_IMAGE = `${STATIC_IMAGES_URL}/placeholder.webp`;

// API URL
export const API_URL = import.meta.env.DEV
  ? `${location.protocol}//${location.hostname}:8787`
  : location.origin;

// Explorer URLs
export const BLOCK_EXPLORER_URL = IS_TESTNET
  ? "https://explorer.testnet.lens.xyz"
  : "https://explorer.lens.xyz";
export const BLOCK_EXPLORER_API_URL = IS_TESTNET
  ? "https://explorer-api.testnet.lens.xyz"
  : "https://explorer-api.lens.xyz";

// Storage URLs
export const STORAGE_NODE_URL = "https://api.grove.storage/";
export const IPFS_GATEWAY = "https://gw.ipfs-lens.dev/ipfs/";

// Tokens / Keys
export const WALLETCONNECT_PROJECT_ID = "03a00eaa6ae180122f4cf2f8ee751a9f";
export const GIPHY_KEY = "eaoaaG2iuww7FHhcPegV5nYSILTl8lvc"; // Read only safe key
export const INFURA_API_KEY = "7a63a964ef5c4c228b02b387e1a8d74f";
export const THIRD_WEB_CLIENT_ID = "50f0da09fdc3c0f9ae25464c55babfdb";

export const LENS_NAMESPACE = "lens/";
export const NATIVE_TOKEN_SYMBOL = NATIVE_TOKEN.symbol;

export const MAX_IMAGE_UPLOAD = 8;

// Named transforms for ImageKit
export const TRANSFORMS = {
  ATTACHMENT: "tr:w-1000,c-at_max",
  AVATAR_BIG: "tr:w-350,h-350,c-at_max",
  AVATAR_SMALL: "tr:w-100,h-100,c-at_max",
  AVATAR_TINY: "tr:w-50,h-50,c-at_max",
  COVER: "tr:w-1350,h-350,c-at_max",
  EXPANDED_AVATAR: "tr:w-1000,h-1000,c-at_max",
  POSTER: "tr:w-512,h-512,c-at_max"
};

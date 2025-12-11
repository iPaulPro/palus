import { chains } from "@lens-chain/sdk/viem";
import { CONTRACTS } from "./contracts";

export const CHAIN = chains.mainnet;
const IS_TESTNET = CHAIN === chains.testnet;

// Lens and Palus Env Config
export const LENS_API_URL = IS_TESTNET
  ? "https://api.testnet.lens.xyz/graphql"
  : "https://api.lens.xyz/graphql";
export const DEFAULT_COLLECT_TOKEN = IS_TESTNET
  ? "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8"
  : CONTRACTS.defaultToken;
export const PALUS_APP = IS_TESTNET
  ? "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7"
  : CONTRACTS.app;
export const PALUS_TREASURY = IS_TESTNET
  ? "0xdaA5EBe0d75cD16558baE6145644EDdFcbA1e868"
  : "0x8589d6dd8acc2c41b7ac8b247458fda18d4c20ae";
export const ADDRESS_PLACEHOLDER = "0x03Ba3...7EF";

// Application
export const BRAND_COLOR = "#0170a3";

// URLs
export const STATIC_ASSETS_URL = "https://static.hey.xyz";
export const STATIC_IMAGES_URL = `${STATIC_ASSETS_URL}/images`;
export const LENS_MEDIA_SNAPSHOT_URL = "https://ik.imagekit.io/lens";
export const DEFAULT_AVATAR = `${STATIC_IMAGES_URL}/default.png`;
export const PLACEHOLDER_IMAGE = `${STATIC_IMAGES_URL}/placeholder.webp`;
export const BLOCK_EXPLORER_URL = "https://lenscan.io";
export const BASE_RPC_URL = "https://base.llamarpc.com";

// Storage
export const STORAGE_NODE_URL = "https://api.grove.storage";
export const IPFS_GATEWAY = "https://gw.ipfs-lens.dev/ipfs";

// Tokens / Keys
export const WALLETCONNECT_PROJECT_ID = "3f7a1aceea44f6ca49f43842e86107a8";
export const GIPHY_KEY = "yNwCXMKkiBrxyyFduF56xCbSuJJM8cMd"; // Read only safe key

export const LENS_NAMESPACE = "lens/";
export const NATIVE_TOKEN_SYMBOL = IS_TESTNET ? "GRASS" : "GHO";
export const WRAPPED_NATIVE_TOKEN_SYMBOL = IS_TESTNET ? "WGRASS" : "WGHO";

export const MAX_IMAGE_UPLOAD = 8;

// Named transforms for ImageKit
export const TRANSFORMS = {
  ATTACHMENT: "tr:w-1000",
  AVATAR_BIG: "tr:w-350,h-350",
  AVATAR_SMALL: "tr:w-100,h-100",
  AVATAR_TINY: "tr:w-50,h-50",
  COVER: "tr:w-1350,h-350",
  EXPANDED_AVATAR: "tr:w-1000,h-1000"
};

export const PERMISSIONS = {
  STAFF: "0xA7f2835e54998c6d7d4A0126eC0ebE91b5E43c69",
  SUBSCRIPTION: "0x4BE5b4519814A57E6f9AaFC6afBB37eAEeE35aA3"
} as const;

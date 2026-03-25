import { CONTRACTS } from "./contracts";

export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";

export const TOKENS = [
  {
    contractAddress: CONTRACTS.nativeToken,
    decimals: 18,
    name: IS_TESTNET ? "GRASS" : "GHO",
    symbol: IS_TESTNET ? "GRASS" : "GHO",
    tipAmounts: [0.1, 0.5, 1, 5, 10]
  },
  {
    contractAddress: CONTRACTS.weth,
    decimals: 6,
    name: "Ether",
    symbol: "ETH",
    tipAmounts: [0.00005, 0.00025, 0.0005, 0.0025, 0.005]
  },
  {
    contractAddress: CONTRACTS.pointlessToken,
    decimals: 18,
    name: "pointless",
    symbol: "pointless",
    tipAmounts: [1_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000]
  },
  {
    contractAddress: CONTRACTS.usdc,
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
    tipAmounts: [0.1, 0.5, 1, 5, 10]
  },
  {
    contractAddress: CONTRACTS.wrappedNativeToken,
    decimals: 18,
    name: IS_TESTNET ? "Wrapped GRASS" : "Wrapped GHO",
    symbol: IS_TESTNET ? "WGRASS" : "WGHO",
    tipAmounts: [0.1, 0.5, 1, 5, 10]
  }
];

export const NATIVE_TOKEN_SYMBOL = IS_TESTNET ? "GRASS" : "GHO";

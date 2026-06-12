import { CONTRACTS } from "./contracts";

export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";

export type Token = {
  contractAddress: string;
  decimals: number;
  name: string;
  symbol: string;
};

export const NATIVE_TOKEN = {
  contractAddress: CONTRACTS.nativeToken,
  decimals: 18,
  name: IS_TESTNET ? "GRASS" : "GHO",
  symbol: IS_TESTNET ? "GRASS" : "GHO"
};

export const TOKENS: Token[] = [
  NATIVE_TOKEN,
  {
    contractAddress: CONTRACTS.weth,
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  {
    contractAddress: CONTRACTS.pointlessToken,
    decimals: 18,
    name: "pointless",
    symbol: "pointless"
  },
  {
    contractAddress: CONTRACTS.usdc,
    decimals: 6,
    name: "USDC",
    symbol: "USDC"
  },
  {
    contractAddress: CONTRACTS.wrappedNativeToken,
    decimals: 18,
    name: IS_TESTNET ? "Wrapped GRASS" : "Wrapped GHO",
    symbol: IS_TESTNET ? "WGRASS" : "WGHO"
  }
];

export const findToken = (address: string) => {
  return TOKENS.find(
    (token) => token.contractAddress.toLowerCase() === address.toLowerCase()
  );
};

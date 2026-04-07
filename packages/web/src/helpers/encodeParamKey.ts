import { type Hex, keccak256, stringToBytes } from "viem";

export const encodeParamKey = (key: string): Hex =>
  keccak256(stringToBytes(key));

import type { AnyKeyValueInput } from "@palus/indexer";
import { encodeAbiParameters, keccak256, stringToBytes } from "viem";

/**
 * Converts a name, type, and value into an KeyValue object with abi-encoded data and a keccak256-hashed key.
 *
 * @param name
 * @param type
 * @param value
 */
export const toKeyValueInput = (
  name: string,
  type: string,
  value: any
): AnyKeyValueInput => {
  return {
    raw: {
      data: encodeAbiParameters([{ name, type }], [value]),
      key: keccak256(stringToBytes(name))
    }
  };
};

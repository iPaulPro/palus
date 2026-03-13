import type { Hex } from "viem";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export const encodeParamData = (type: string, value: any): Hex => {
  return encodeAbiParameters(parseAbiParameters(`${type} x`), [value]);
};

import { isAddress } from "viem";

const formatAddress = (address: string | null, sliceSize = 4): string => {
  if (!address) {
    return "";
  }

  if (isAddress(address)) {
    const start = address.slice(0, sliceSize);
    const end = address.slice(address.length - sliceSize);
    return `${start}…${end}`;
  }

  return address;
};

export default formatAddress;

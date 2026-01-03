import type { AccountFragment } from "@palus/indexer";
import { zeroAddress } from "viem";

const isAccountDeleted = (account: AccountFragment): boolean =>
  account.owner === zeroAddress;

export default isAccountDeleted;

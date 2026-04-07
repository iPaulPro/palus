import type { Account, AccountFragment } from "@palus/indexer";
import { zeroAddress } from "viem";

const isAccountDeleted = (account: AccountFragment | Account): boolean =>
  account.owner === zeroAddress;

export default isAccountDeleted;

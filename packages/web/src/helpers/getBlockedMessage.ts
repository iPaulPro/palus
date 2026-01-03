import type { AccountFragment } from "@palus/indexer";
import getAccount from "@/helpers/getAccount";

const formatMessage = (
  account: AccountFragment,
  formatter: (username: string) => string
): string => {
  const { username } = getAccount(account);

  return formatter(username);
};

export const getBlockedByMeMessage = (account: AccountFragment): string =>
  formatMessage(account, (username) => `You have blocked ${username}`);

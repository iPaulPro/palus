import {
  AccountsOrderBy,
  PageSize,
  useAccountsLazyQuery
} from "@palus/indexer";
import { useEffect, useState } from "react";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";

export type MentionAccount = {
  address: string;
  username: string;
  name: string;
  picture: string;
  score: number;
};

const useAccountMentionQuery = (query: string): MentionAccount[] => {
  const [results, setResults] = useState<MentionAccount[]>([]);
  const [searchAccounts] = useAccountsLazyQuery();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    searchAccounts({
      variables: {
        request: {
          filter: { searchBy: { localNameQuery: query } },
          orderBy: AccountsOrderBy.AccountScore,
          pageSize: PageSize.Ten
        }
      }
    }).then(({ data }) => {
      const search = data?.accounts;
      const accountsSearchResult = search;
      const accounts = accountsSearchResult?.items;
      const accountsResults = (accounts ?? []).reduce<MentionAccount[]>(
        (acc, account) => {
          if (!account.operations?.isBlockedByMe) {
            acc.push({
              address: account.address,
              name: getAccount(account).name,
              picture: getAvatar(account),
              score: account.score,
              username: getAccount(account).username
            });
          }
          return acc;
        },
        []
      );

      setResults(accountsResults);
    });
  }, [query, searchAccounts]);

  return results;
};

export default useAccountMentionQuery;

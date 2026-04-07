import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  type AccountFragment,
  AccountsOrderBy,
  type AccountsRequest,
  PageSize,
  useAccountsLazyQuery
} from "@palus/indexer";
import { useClickAway, useDebounce } from "@uidotdev/usehooks";
import type { KeyboardEvent, RefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import Loader from "@/components/Shared/Loader";
import { Card, Form, Input, useZodForm } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import getAccount from "@/helpers/getAccount";
import { useAccountLinkStore } from "@/store/non-persisted/navigation/useAccountLinkStore";
import { useSearchStore } from "@/store/persisted/useSearchStore";
import RecentAccounts from "./RecentAccounts";

interface SearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  query?: string | null;
}

const ValidationSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, { message: "Enter something to search" })
    .max(100, { message: "Query should not exceed 100 characters" })
});

const Search = ({
  placeholder = "Search…",
  autoFocus = false,
  query: initialQuery
}: SearchProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const { setCachedAccount } = useAccountLinkStore();
  const { addAccount } = useSearchStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [accounts, setAccounts] = useState<AccountFragment[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const form = useZodForm({
    defaultValues: { query: "" },
    resetOptions: { keepDefaultValues: true },
    schema: ValidationSchema,
    values: initialQuery ? { query: initialQuery } : undefined
  });

  const query = form.watch("query");
  const debouncedSearchText = useDebounce<string>(query, 500);

  const handleReset = useCallback(() => {
    setShowDropdown(false);
    setAccounts([]);
    setSelectedIndex(-1);
    form.reset();
  }, [form]);

  const dropdownRef = useClickAway(() => {
    handleReset();
  }) as RefObject<HTMLDivElement>;

  const [searchAccounts, { loading }] = useAccountsLazyQuery();

  const handleSubmit = useCallback(
    ({ query }: z.infer<typeof ValidationSchema>) => {
      const search = query.trim();
      if (pathname === "/search") {
        navigate(`/search?q=${encodeURIComponent(search)}&type=${type}`);
      } else if (pathname === "/groups") {
        navigate(`/search?q=${encodeURIComponent(search)}&type=groups`);
      } else {
        navigate(`/search?q=${encodeURIComponent(search)}&type=accounts`);
      }
      handleReset();
    },
    [pathname, navigate, type, handleReset]
  );

  const handleShowDropdown = useCallback(() => {
    setShowDropdown(true);
  }, []);

  const handleSelectAccount = useCallback(
    (account: AccountFragment) => {
      setCachedAccount(account);
      addAccount(account.address);
      navigate(getAccount(account).link);
      handleReset();
    },
    [setCachedAccount, addAccount, navigate, handleReset]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const hasResults =
        pathname !== "/search" &&
        showDropdown &&
        !loading &&
        accounts.length > 0;

      if (!hasResults) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < accounts.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          if (selectedIndex >= 0 && accounts[selectedIndex]) {
            event.preventDefault();
            handleSelectAccount(accounts[selectedIndex]);
          }
          break;
        case "Escape":
          setSelectedIndex(-1);
          setShowDropdown(false);
          break;
      }
    },
    [
      pathname,
      showDropdown,
      loading,
      accounts,
      selectedIndex,
      handleSelectAccount
    ]
  );

  useEffect(() => {
    if (pathname !== "/search" && showDropdown && debouncedSearchText) {
      const request: AccountsRequest = {
        filter: { searchBy: { localNameQuery: debouncedSearchText } },
        orderBy: AccountsOrderBy.AccountScore,
        pageSize: PageSize.Fifty
      };

      searchAccounts({ variables: { request } }).then((res) => {
        if (res.data?.accounts?.items) {
          setAccounts(res.data.accounts.items);
          setSelectedIndex(-1);
        }
      });
    }
  }, [debouncedSearchText]);

  return (
    <div className="w-full">
      <Form form={form} onSubmit={handleSubmit}>
        <Input
          autoFocus={autoFocus}
          className="px-3 py-3 text-base sm:text-sm"
          iconLeft={<MagnifyingGlassIcon />}
          iconRight={
            <XMarkIcon
              className={cn("cursor-pointer", query ? "visible" : "invisible")}
              onClick={handleReset}
            />
          }
          onClick={handleShowDropdown}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          type="text"
          {...form.register("query")}
        />
      </Form>
      {pathname !== "/search" && showDropdown ? (
        <div className="fixed z-10 mt-2 w-[360px]" ref={dropdownRef}>
          <Card className="max-h-[80vh] overflow-y-auto py-2">
            {!debouncedSearchText && (
              <RecentAccounts onAccountClick={handleReset} />
            )}
            {loading ? (
              <Loader className="my-3" message="Searching users" small />
            ) : (
              <>
                {accounts.map((account, index) => (
                  <div
                    className={cn(
                      "cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                      index === selectedIndex && "bg-gray-100 dark:bg-gray-800"
                    )}
                    key={account.address}
                    onClick={() => handleSelectAccount(account)}
                  >
                    <SingleAccount
                      account={account}
                      hideFollowButton
                      hideUnfollowButton
                      linkToAccount={false}
                      showUserPreview={false}
                    />
                  </div>
                ))}
                {accounts.length ? null : (
                  <div className="px-4 py-2">
                    Try searching for people or keywords
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default Search;

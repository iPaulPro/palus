import {
  type AccountFragment,
  AccountsOrderBy,
  type AccountsRequest,
  PageSize,
  useAccountsLazyQuery
} from "@palus/indexer";
import { useDebounce } from "@uidotdev/usehooks";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useState
} from "react";
import Loader from "@/components/Shared/Loader";
import { Card, Input } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import SmallSingleAccount from "./SmallSingleAccount";

interface SearchAccountsProps {
  error?: boolean;
  hideDropdown?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAccountSelected: (account: AccountFragment) => void;
  placeholder?: string;
  value: string;
}

const SearchAccounts = ({
  error = false,
  hideDropdown = false,
  onChange,
  onAccountSelected,
  placeholder = "Search…",
  value
}: SearchAccountsProps) => {
  const [searchAccounts, { data, loading }] = useAccountsLazyQuery();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedValue = useDebounce<string>(value, 500);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    if (debouncedValue) {
      const request: AccountsRequest = {
        filter: { searchBy: { localNameQuery: debouncedValue } },
        orderBy: AccountsOrderBy.AccountScore,
        pageSize: PageSize.Fifty
      };

      searchAccounts({ variables: { request } });
    }
  }, [debouncedValue, searchAccounts]);

  const accounts = data?.accounts?.items;
  const displayedAccounts = accounts?.slice(0, 7);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const hasResults =
      !hideDropdown &&
      value.length > 0 &&
      !loading &&
      displayedAccounts &&
      displayedAccounts.length > 0;

    if (!hasResults) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < displayedAccounts.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (selectedIndex >= 0 && displayedAccounts[selectedIndex]) {
          event.preventDefault();
          onAccountSelected(displayedAccounts[selectedIndex]);
        }
        break;
      case "Escape":
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <Input
        error={error}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {!hideDropdown && value.length > 0 && (
        <div className="absolute mt-2 flex w-[94%] max-w-md flex-col">
          <Card className="z-[2] max-h-[80vh] overflow-y-auto py-2">
            {loading ? (
              <Loader className="my-3" message="Searching users" small />
            ) : accounts && accounts.length > 0 ? (
              displayedAccounts?.map((account, index) => (
                <div
                  className={cn(
                    "cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                    index === selectedIndex && "bg-gray-100 dark:bg-gray-800"
                  )}
                  key={account.address}
                  onClick={() => onAccountSelected(account)}
                >
                  <SmallSingleAccount account={account} />
                </div>
              ))
            ) : (
              <div className="px-4 py-2">No matching users</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchAccounts;

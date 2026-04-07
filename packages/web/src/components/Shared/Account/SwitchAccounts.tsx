import { UserPlusIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  ManagedAccountsVisibility,
  useAccountsAvailableQuery,
  useSwitchAccountMutation
} from "@palus/indexer";
import { useCallback, useState } from "react";
import { useConnection } from "wagmi";
import Loader from "@/components/Shared/Loader";
import { ErrorMessage, Spinner, WarningMessage } from "@/components/Shared/UI";
import { ERRORS } from "@/data/errors";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import reloadAllTabs from "@/helpers/reloadAllTabs";
import { useAuthModalStore } from "@/store/non-persisted/modal/useAuthModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { signIn } from "@/store/persisted/useAuthStore";
import SmallSingleAccount from "./SmallSingleAccount";

const SwitchAccounts = () => {
  const { currentAccount } = useAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggingInAccountId, setLoggingInAccountId] = useState<null | string>(
    null
  );
  const { address } = useConnection();
  const { setShowAuthModal } = useAuthModalStore();

  const onError = useCallback((error?: unknown) => {
    setIsSubmitting(false);
    setLoggingInAccountId(null);
    errorToast(error);
  }, []);

  const { data, error, loading } = useAccountsAvailableQuery({
    skip: !address,
    variables: {
      accountsAvailableRequest: {
        hiddenFilter: ManagedAccountsVisibility.NoneHidden,
        managedBy: address
      },
      lastLoggedInAccountRequest: { address: address }
    }
  });
  const [switchAccount] = useSwitchAccountMutation();

  if (!address) {
    return (
      <WarningMessage
        className="m-5"
        message="Connect your wallet to switch accounts"
        title="No wallet connected"
      />
    );
  }

  if (loading) {
    return <Loader className="my-5" message="Loading Accounts" />;
  }

  const accountsAvailable = data?.accountsAvailable.items || [];
  const sortedAccounts = [...accountsAvailable].sort((a, b) => {
    const authAddress = currentAccount?.address.toLowerCase();
    const aAddress = a.account.address.toLowerCase();
    const bAddress = b.account.address.toLowerCase();

    if (aAddress === authAddress) return -1;
    if (bAddress === authAddress) return 1;

    if (a.account.metadata?.name) {
      if (b.account.metadata?.name) {
        return a.account.metadata.name.localeCompare(b.account.metadata.name);
      }
      return a.account.metadata.name.localeCompare(
        b.account.username?.localName || ""
      );
    }
    if (a.account.username?.localName) {
      return a.account.username.localName.localeCompare(
        b.account.username?.localName || ""
      );
    }
    return a.account.address.localeCompare(b.account.address);
  });

  const handleSwitchAccount = async (account: string) => {
    try {
      setLoggingInAccountId(account);
      setIsSubmitting(true);

      const auth = await switchAccount({ variables: { request: { account } } });

      if (auth.data?.switchAccount.__typename === "AuthenticationTokens") {
        const accessToken = auth.data?.switchAccount.accessToken;
        const refreshToken = auth.data?.switchAccount.refreshToken;
        // Preserve theme and other local UI state by not signing out completely.
        signIn({ accessToken, refreshToken });
        // clear cached window scroll positions
        sessionStorage.clear();
        reloadAllTabs();
        return;
      }

      return onError({ message: ERRORS.SomethingWentWrong });
    } catch {
      onError();
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-2">
      <ErrorMessage
        className="m-2"
        error={error}
        title="Failed to load accounts"
      />
      {sortedAccounts.map((accountAvailable, index) => (
        <button
          className="flex w-full cursor-pointer items-center justify-between space-x-2 rounded-lg py-3 pr-4 pl-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          disabled={
            currentAccount?.address === accountAvailable.account.address
          }
          key={accountAvailable?.account.address}
          onClick={async () => {
            const selectedAccount = sortedAccounts[index].account;
            await handleSwitchAccount(selectedAccount.address);
          }}
          type="button"
        >
          <div
            className={cn(
              currentAccount?.address === accountAvailable.account.address &&
                "font-bold"
            )}
          >
            <SmallSingleAccount account={accountAvailable.account} />
          </div>
          {isSubmitting &&
          accountAvailable.account.address === loggingInAccountId ? (
            <Spinner size="xs" />
          ) : currentAccount?.address === accountAvailable.account.address ? (
            <CheckCircleIcon className="size-5 text-green-600" />
          ) : null}
        </button>
      ))}
      <div className="divider mt-2" />
      <button
        className="mt-2 mt-2 flex w-full cursor-pointer items-center gap-x-2 rounded-lg px-4 py-2 text-start text-gray-700 text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        onClick={() => setShowAuthModal(true, "signup")}
        type={"button"}
      >
        <UserPlusIcon className="size-5" />
        New Account
      </button>
    </div>
  );
};

export default SwitchAccounts;

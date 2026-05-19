import { MenuItem } from "@headlessui/react";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import {
  type AccountFragment,
  useBanGroupAccountsMutation
} from "@palus/indexer";
import { type MouseEvent, useCallback, useState } from "react";
import Loader from "@/components/Shared/Loader";
import { ADMIN_GROUP_ADDRESS } from "@/data/constants";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

const menuItemClassName = ({ focus }: { focus: boolean }) =>
  cn(
    { "dropdown-active": focus },
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm text-red-500"
  );

interface Props {
  account: AccountFragment;
}

const Ban = ({ account }: Props) => {
  const { currentAccount } = useAccountStore();
  const { bannedAccounts, addBannedAccount } = useBannedAccountsStore();
  const handleTransactionLifecycle = useTransactionLifecycle();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const onCompleted = () => {
    setIsSubmitting(false);
    addBannedAccount(account.address);
  };

  const [banAccounts] = useBanGroupAccountsMutation({
    onCompleted: async ({ banGroupAccounts }) => {
      if (banGroupAccounts.__typename === "BanGroupAccountsResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: banGroupAccounts
      });
    },
    onError
  });

  const banAccount = useCallback(
    (event: MouseEvent) => {
      stopEventPropagation(event);
      banAccounts({
        variables: {
          request: {
            accounts: [account.address],
            group: ADMIN_GROUP_ADDRESS
          }
        }
      }).catch(onError);
    },
    [banAccounts, account.address]
  );

  if (!currentAccount?.isAdmin || bannedAccounts.includes(account.address)) {
    return null;
  }

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={banAccount}
    >
      {isSubmitting ? <Loader small /> : <NoSymbolIcon className="size-4" />}
      <div>Ban account</div>
    </MenuItem>
  );
};

export default Ban;

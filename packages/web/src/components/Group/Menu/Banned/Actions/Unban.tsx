import { useApolloClient } from "@apollo/client";
import { MenuItem } from "@headlessui/react";
import { UserMinusIcon } from "@heroicons/react/24/outline";
import {
  type AccountFragment,
  GroupBannedAccountsDocument,
  type GroupBannedAccountsQuery,
  useUnbanGroupAccountsMutation
} from "@palus/indexer";
import { type MouseEvent, useCallback } from "react";
import { toast } from "sonner";
import Loader from "@/components/Shared/Loader";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import type { ApolloClientError } from "@/types/errors";

interface Props {
  account: AccountFragment;
  groupAddress: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isSubmitting: boolean;
}

const menuItemClassName = ({ focus }: { focus: boolean }) =>
  cn(
    { "dropdown-active": focus },
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm"
  );

const UnbanAccount = ({
  account,
  groupAddress,
  setIsSubmitting,
  isSubmitting
}: Props) => {
  const client = useApolloClient();
  const handleTransactionLifecycle = useTransactionLifecycle();

  const onError = useCallback(
    (error: ApolloClientError) => {
      setIsSubmitting(false);
      errorToast(error);
    },
    [setIsSubmitting]
  );

  const updateCache = useCallback(() => {
    const currentData = client.cache.readQuery<GroupBannedAccountsQuery>({
      query: GroupBannedAccountsDocument,
      variables: { request: { group: groupAddress } }
    });

    if (!currentData?.groupBannedAccounts) return;

    const newItems = currentData.groupBannedAccounts.items.filter(
      (item) => item.account.address !== account.address
    );

    client.cache.writeQuery({
      data: {
        groupBannedAccounts: {
          ...currentData.groupBannedAccounts,
          items: newItems
        }
      },
      overwrite: true,
      query: GroupBannedAccountsDocument,
      variables: { request: { group: groupAddress } }
    });
  }, [account.address, groupAddress, client.cache]);

  const onCompleted = () => {
    setIsSubmitting(false);
    updateCache();
    toast.success("Account unbanned");
  };

  const [unbanAccounts] = useUnbanGroupAccountsMutation({
    onCompleted: async ({ unbanGroupAccounts }) => {
      if (unbanGroupAccounts.__typename === "UnbanGroupAccountsResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: unbanGroupAccounts
      });
    },
    onError
  });

  const unbanAccount = useCallback(
    (event: MouseEvent) => {
      stopEventPropagation(event);
      setIsSubmitting(true);
      unbanAccounts({
        variables: {
          request: {
            accounts: [account.address],
            group: groupAddress
          }
        }
      }).catch(onError);
    },
    [groupAddress, setIsSubmitting, unbanAccounts, account.address, onError]
  );

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={unbanAccount}
    >
      {isSubmitting ? <Loader small /> : <UserMinusIcon className="size-4" />}
      <div>Unban account</div>
    </MenuItem>
  );
};

export default UnbanAccount;

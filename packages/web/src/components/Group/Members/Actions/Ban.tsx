import type { ApolloCache, NormalizedCacheObject } from "@apollo/client";
import { MenuItem } from "@headlessui/react";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import {
  type AccountFragment,
  useBanGroupAccountsMutation
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
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm text-red-500"
  );

const BanMember = ({
  account,
  groupAddress,
  setIsSubmitting,
  isSubmitting
}: Props) => {
  const handleTransactionLifecycle = useTransactionLifecycle();

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const onCompleted = () => {
    setIsSubmitting(false);
    toast.success("Account banned");
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

  const updateCache = (cache: ApolloCache<NormalizedCacheObject>) => {
    cache.modify({
      fields: {
        groupMembers(existing, { readField }) {
          if (!existing) return existing;
          return {
            ...existing,
            items: existing.items.filter(
              (itemRef: any) =>
                readField("address", readField("account", itemRef)) !==
                account.address
            )
          };
        },
        groupStats(existing, { readField }) {
          if (!existing) return existing;
          const currentTotal = readField("totalMembers", existing) as number;
          return {
            ...existing,
            totalMembers: currentTotal - 1
          };
        }
      }
    });
  };

  const handleClick = useCallback(
    async (event: MouseEvent) => {
      stopEventPropagation(event);
      setIsSubmitting(true);
      await banAccounts({
        update: updateCache,
        variables: {
          request: {
            accounts: [account.address],
            group: groupAddress
          }
        }
      });
    },
    [account, groupAddress]
  );

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? <Loader small /> : <NoSymbolIcon className="size-4" />}
      <div>Ban account</div>
    </MenuItem>
  );
};

export default BanMember;

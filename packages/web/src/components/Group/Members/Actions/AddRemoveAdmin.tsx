import { useApolloClient } from "@apollo/client";
import { MenuItem } from "@headlessui/react";
import { UserMinusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import {
  type AccountFragment,
  AdminsForDocument,
  type AdminsForQuery,
  useAddAdminsMutation,
  useRemoveAdminsMutation
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
  admins: AccountFragment[] | undefined;
}

const menuItemClassName = ({ focus }: { focus: boolean }) =>
  cn(
    { "dropdown-active": focus },
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm"
  );

const AddRemoveAdmin = ({
  admins,
  account,
  groupAddress,
  setIsSubmitting,
  isSubmitting
}: Props) => {
  const client = useApolloClient();
  const handleTransactionLifecycle = useTransactionLifecycle();

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const updateCache = useCallback(
    (isRemoval: boolean) => {
      const currentData = client.cache.readQuery<AdminsForQuery>({
        query: AdminsForDocument,
        variables: { request: { address: groupAddress } }
      });

      if (!currentData?.adminsFor) return;

      const newItems = isRemoval
        ? currentData.adminsFor.items.filter(
            (item) => item.account.address !== account.address
          )
        : [
            { __typename: "Admin" as const, account: account },
            ...currentData.adminsFor.items
          ];

      client.cache.writeQuery({
        data: {
          adminsFor: {
            ...currentData.adminsFor,
            items: newItems
          }
        },
        overwrite: true,
        query: AdminsForDocument,
        variables: { request: { address: groupAddress } }
      });
    },
    [client, groupAddress, account]
  );

  const onCompleted = async (isRemoval: boolean) => {
    setIsSubmitting(false);
    updateCache(isRemoval);
    toast.success(
      isRemoval ? "Admin removed successfully" : "Admin added successfully"
    );
  };

  const [addAdmins] = useAddAdminsMutation({
    onCompleted: async ({ addAdmins }) => {
      return await handleTransactionLifecycle({
        onCompleted: () => onCompleted(false),
        onError,
        transactionData: addAdmins
      });
    },
    onError
  });

  const [removeAdmins] = useRemoveAdminsMutation({
    onCompleted: async ({ removeAdmins }) => {
      return await handleTransactionLifecycle({
        onCompleted: () => onCompleted(true),
        onError,
        transactionData: removeAdmins
      });
    },
    onError
  });

  const isAdmin = admins?.some((admin) => admin.address === account.address);

  const handleClick = useCallback(
    async (event: MouseEvent) => {
      stopEventPropagation(event);
      setIsSubmitting(true);

      if (isAdmin) {
        await removeAdmins({
          variables: {
            request: {
              address: groupAddress,
              admins: [account.address]
            }
          }
        });
        return;
      }

      await addAdmins({
        variables: {
          request: {
            address: groupAddress,
            admins: [account.address]
          }
        }
      });
    },
    [account]
  );

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? (
        <Loader small />
      ) : isAdmin ? (
        <UserMinusIcon className="size-4" />
      ) : (
        <UserPlusIcon className="size-4" />
      )}
      <div>{isAdmin ? "Remove" : "Make"} admin</div>
    </MenuItem>
  );
};

export default AddRemoveAdmin;

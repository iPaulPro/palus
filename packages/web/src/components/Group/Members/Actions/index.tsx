import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { AccountFragment, GroupFragment } from "@palus/indexer";
import { Fragment, useState } from "react";
import Loader from "@/components/Shared/Loader";
import MenuTransition from "@/components/Shared/MenuTransition";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import AddRemoveAdmin from "./AddRemoveAdmin";
import BanMember from "./Ban";

interface Props {
  account: AccountFragment;
  group: GroupFragment;
  admins: AccountFragment[] | undefined;
}

const AdminActions = ({ account, group, admins }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentAccount } = useAccountStore();

  if (
    group.owner !== currentAccount?.address ||
    group.owner === account.address
  ) {
    return null;
  }

  if (isSubmitting) {
    return <Loader small />;
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton as={Fragment}>
        <button
          aria-label="More"
          className="rounded-full p-1.5 hover:bg-gray-300/20"
          onClick={stopEventPropagation}
          type="button"
        >
          <EllipsisVerticalIcon className="size-5 text-gray-500 dark:text-gray-200" />
        </button>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor="bottom end"
          className="mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
          static
        >
          <AddRemoveAdmin
            account={account}
            admins={admins}
            groupAddress={group.address}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
          <div className="divider" />
          <BanMember
            account={account}
            groupAddress={group.address}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default AdminActions;

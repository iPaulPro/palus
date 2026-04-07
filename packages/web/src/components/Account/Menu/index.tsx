import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import { Fragment } from "react";
import OpenExplorer from "@/components/Account/Menu/OpenExplorer";
import MenuTransition from "@/components/Shared/MenuTransition";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import Ban from "./Ban";
import Block from "./Block";
import CopyAddress from "./CopyAddress";
import Mute from "./Mute";
import Report from "./Report";
import Share from "./Share";

interface AccountMenuProps {
  account: AccountFragment;
}

const AccountMenu = ({ account }: AccountMenuProps) => {
  const { currentAccount } = useAccountStore();

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
          <Share account={account} />
          <CopyAddress account={account} />
          <OpenExplorer account={account} />
          {currentAccount && currentAccount?.address !== account.address ? (
            <>
              <div className="divider" />
              <Block account={account} />
              <Mute account={account} />
              <div className="divider" />
              <Report account={account} />
              <Ban account={account} />
            </>
          ) : null}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default AccountMenu;

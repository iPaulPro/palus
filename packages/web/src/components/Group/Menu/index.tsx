import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CogIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { GroupFragment } from "@palus/indexer";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router";
import MenuTransition from "@/components/Shared/MenuTransition";
import { Modal } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import Banned from "./Banned";
import BannedList from "./Banned/List";

interface Props {
  group: GroupFragment;
}

const GroupMenu = ({ group }: Props) => {
  const [showBannedModal, setShowBannedModal] = useState(false);

  const navigate = useNavigate();
  const { currentAccount } = useAccountStore();

  if (currentAccount?.address !== group.owner) {
    return null;
  }

  return (
    <>
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
            <MenuItem
              as="div"
              className={({ focus }) =>
                cn(
                  { "dropdown-active": focus },
                  "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
                )
              }
              onClick={() => navigate(`/g/${group.address}/settings`)}
            >
              <div className="flex items-center space-x-2">
                <CogIcon className="size-4" />
                <div>Group settings</div>
              </div>
            </MenuItem>
            <Banned setShowModal={setShowBannedModal} />
          </MenuItems>
        </MenuTransition>
      </Menu>
      <Modal
        onClose={() => setShowBannedModal(false)}
        show={showBannedModal}
        title="Banned Accounts"
      >
        <BannedList group={group} />
      </Modal>
    </>
  );
};

export default GroupMenu;

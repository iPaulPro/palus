import { XMarkIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Link } from "react-router";
import AccountLink from "@/components/Shared/Account/AccountLink";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import Footer from "@/components/Shared/Footer";
import Bookmarks from "@/components/Shared/Navbar/NavItems/Bookmarks";
import Groups from "@/components/Shared/Navbar/NavItems/Groups";
import Install from "@/components/Shared/Navbar/NavItems/Install";
import Logout from "@/components/Shared/Navbar/NavItems/Logout";
import Settings from "@/components/Shared/Navbar/NavItems/Settings";
import SwitchAccount from "@/components/Shared/Navbar/NavItems/SwitchAccount";
import ThemeSwitch from "@/components/Shared/Navbar/NavItems/ThemeSwitch";
import YourAccount from "@/components/Shared/Navbar/NavItems/YourAccount";
import cn from "@/helpers/cn";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import { useInstallPromptStore } from "@/store/non-persisted/alert/installPromptStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface Props {
  onOpenChange: (open: boolean) => void;
}

const MobileDrawerMenu = ({ onOpenChange }: Props) => {
  const { currentAccount } = useAccountStore();
  const { event: installEvent } = useInstallPromptStore();
  const isStandalone = useMediaQuery(IS_STANDALONE);

  const handleCloseDrawer = () => {
    onOpenChange(false);
  };

  const itemClass = "py-3 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <div className="no-scrollbar flex size-full flex-col overflow-y-auto rounded-t-2xl bg-surface pt-2 pb-4 md:hidden">
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <AccountLink
            account={currentAccount as AccountFragment}
            className="flex items-center space-x-2 px-5 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
            onClick={handleCloseDrawer}
          >
            <SingleAccount
              account={currentAccount as AccountFragment}
              linkToAccount={false}
              showUserPreview={false}
            />
          </AccountLink>
          <button className="px-6" onClick={handleCloseDrawer} type="button">
            <XMarkIcon className="size-5" />
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900">
          <div className="divider" />
          <AccountLink
            account={currentAccount as AccountFragment}
            onClick={handleCloseDrawer}
          >
            <YourAccount className={cn(itemClass, "px-4")} />
          </AccountLink>
          <SwitchAccount className={cn(itemClass, "px-4")} />
          <div className="divider" />
        </div>
        <div className="bg-white dark:bg-gray-900">
          <div className="divider" />
          <Link onClick={handleCloseDrawer} to="/groups">
            <Groups className={cn(itemClass, "px-4")} />
          </Link>
          <Link onClick={handleCloseDrawer} to="/bookmarks">
            <Bookmarks className={cn(itemClass, "px-4")} />
          </Link>
          <div className="divider" />
        </div>
        <div className="bg-white dark:bg-gray-900">
          <div className="divider" />
          <div>
            <Link onClick={handleCloseDrawer} to="/settings">
              <Settings className={cn(itemClass, "px-4")} />
            </Link>
            <ThemeSwitch
              className={cn(itemClass, "px-4")}
              onClick={handleCloseDrawer}
            />
          </div>
          <div className="divider" />
        </div>
        {!isStandalone && installEvent ? (
          <div className="bg-white dark:bg-gray-900">
            <div className="divider" />
            <Install className={cn(itemClass, "px-4")} />
            <div className="divider" />
          </div>
        ) : null}
        <div className="bg-white dark:bg-gray-900">
          <div className="divider" />
          <div className="hover:bg-gray-100 dark:hover:bg-gray-800">
            <Logout
              className={cn(itemClass, "px-4 py-3")}
              onLogout={handleCloseDrawer}
            />
          </div>
          <div className="divider" />
        </div>
      </div>
      <div
        className={cn("flex flex-grow flex-col justify-end py-4", {
          "pb-6": isStandalone
        })}
      >
        <Footer />
      </div>
    </div>
  );
};

export default MobileDrawerMenu;

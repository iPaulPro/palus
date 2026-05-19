import { XMarkIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import { useMediaQuery } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "motion/react";
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
import { SwipeDirection, SwipeToDismiss } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import { useInstallPromptStore } from "@/store/non-persisted/alert/installPromptStore";
import { useMobileDrawerModalStore } from "@/store/non-persisted/modal/useMobileDrawerModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const MobileDrawerMenu = () => {
  const { currentAccount } = useAccountStore();
  const { setShow: setShowMobileDrawer } = useMobileDrawerModalStore();
  const { event: installEvent } = useInstallPromptStore();
  const isStandalone = useMediaQuery(IS_STANDALONE);

  const handleCloseDrawer = () => {
    setShowMobileDrawer(false);
  };

  const itemClass = "py-3 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <div
      className="fixed inset-0 z-10 bg-gray-500/75 dark:bg-gray-900/80"
      onClick={handleCloseDrawer}
    >
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0"
          exit={{ opacity: 0, y: 100 }}
          initial={{ opacity: 0, y: 100 }}
          key={"mobile-drawer"}
          transition={{ damping: 20, stiffness: 260, type: "tween" }}
        >
          <SwipeToDismiss
            directions={[SwipeDirection.DOWN]}
            dismissThreshold={0.2}
            onDismissEnd={handleCloseDrawer}
          >
            <SwipeToDismiss.Target
              className="flex max-h-full flex-col overflow-hidden rounded-t-2xl bg-surface pt-2 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <AccountLink
                    account={currentAccount as AccountFragment}
                    className="flex items-center gap-x-2 px-5 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                    onClick={handleCloseDrawer}
                  >
                    <SingleAccount
                      account={currentAccount as AccountFragment}
                      linkToAccount={false}
                      showUserPreview={false}
                    />
                  </AccountLink>
                  <button
                    className="px-6"
                    onClick={handleCloseDrawer}
                    type="button"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-900">
                  <div className="divider" />
                  <SwitchAccount className={cn(itemClass, "px-4")} />
                  <AccountLink
                    account={currentAccount as AccountFragment}
                    onClick={handleCloseDrawer}
                  >
                    <YourAccount className={cn(itemClass, "px-4")} />
                  </AccountLink>
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
                      onClick={handleCloseDrawer}
                    />
                  </div>
                  <div className="divider" />
                </div>
              </div>
              <div
                className={cn("flex flex-col justify-end py-4", {
                  "pb-6": isStandalone
                })}
              >
                <Footer />
              </div>
            </SwipeToDismiss.Target>
          </SwipeToDismiss>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MobileDrawerMenu;

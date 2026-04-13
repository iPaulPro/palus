import {
  BellIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  WalletIcon as WalletOutline
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellIconSolid,
  HomeIcon as HomeIconSolid,
  WalletIcon as WalletSolid
} from "@heroicons/react/24/solid";
import { useLongPress } from "@uidotdev/usehooks";
import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Image } from "@/components/Shared/UI";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import useHasNewNotifications from "@/hooks/useHasNewNotifications";
import { useMobileDrawerModalStore } from "@/store/non-persisted/modal/useMobileDrawerModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import MobileDrawerMenu from "./MobileDrawerMenu";

interface NavigationItemProps {
  path: string;
  label: string;
  outline: ReactNode;
  solid: ReactNode;
  isActive: boolean;
  onClick?: (e: MouseEvent) => void;
  showIndicator?: boolean;
}

const NavigationItem = ({
  path,
  label,
  outline,
  solid,
  isActive,
  onClick,
  showIndicator
}: NavigationItemProps) => (
  <Link
    aria-label={label}
    className="center my-3 flex flex-1"
    onClick={onClick}
    to={path}
  >
    <div className="relative">
      {isActive ? solid : outline}
      {showIndicator && (
        <span className="absolute -top-1 -right-1 size-2 rounded-full bg-brand-500" />
      )}
    </div>
  </Link>
);

const BottomNavigation = () => {
  const { pathname } = useLocation();
  const { currentAccount } = useAccountStore();
  const { show: showMobileDrawer, setShow: setShowMobileDrawer } =
    useMobileDrawerModalStore();
  const hasNewNotifications = useHasNewNotifications();

  const navigate = useNavigate();
  const attrs = useLongPress(() => {
    navigate(`/u/${getAccount(currentAccount).username}`);
  });

  const handleAccountClick = () => setShowMobileDrawer(true);

  const handleClick = (path: string, e: MouseEvent) => {
    if (path === pathname) {
      e.preventDefault();
      window.scrollTo(0, 0);
    }
  };

  const navigationItems = [
    {
      label: "Home",
      outline: <HomeIcon className="size-6" />,
      path: "/",
      solid: <HomeIconSolid className="size-6" />
    },
    {
      label: "Search",
      outline: <MagnifyingGlassIcon className="size-6" />,
      path: "/search",
      solid: <MagnifyingGlassIcon className="size-6" />
    },
    // {
    //   label: "Explore",
    //   outline: <GlobeOutline className="size-6" />,
    //   path: "/explore",
    //   solid: <GlobeSolid className="size-6" />
    // },
    {
      label: "Notifications",
      outline: <BellIcon className="size-6" />,
      path: "/notifications",
      solid: <BellIconSolid className="size-6" />
    },
    {
      label: "Wallet",
      outline: <WalletOutline className="size-6" />,
      path: "/wallet",
      solid: <WalletSolid className="size-6" />
    }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[5] border-gray-200 border-t bg-card pb-safe md:hidden dark:border-gray-800">
      {showMobileDrawer && <MobileDrawerMenu />}
      <div className="flex justify-between">
        {navigationItems.map(({ path, label, outline, solid }) => (
          <NavigationItem
            isActive={pathname === path}
            key={path}
            label={label}
            onClick={(e) => handleClick(path, e)}
            outline={outline}
            path={path}
            showIndicator={hasNewNotifications && path === "/notifications"}
            solid={solid}
          />
        ))}
        {currentAccount && (
          <button
            aria-label="Your account"
            className="center touch-callout-none flex flex-1"
            onClick={handleAccountClick}
            onContextMenu={(event) => event.preventDefault()}
            type="button"
            {...attrs}
          >
            <Image
              alt={currentAccount.address}
              className="size-7 rounded-full border border-gray-200 object-cover dark:border-gray-800"
              src={getAvatar(currentAccount)}
            />
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;

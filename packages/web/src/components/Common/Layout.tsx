import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import {
  PageSize,
  useGroupBannedAccountsQuery,
  useMeQuery
} from "@palus/indexer";
import { useIsClient } from "@uidotdev/usehooks";
import { domAnimation, LazyMotion } from "motion/react";
import { memo, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Toaster, type ToasterProps } from "sonner";
import BottomAudioPlayer from "@/components/Shared/Audio/BottomAudioPlayer";
import FullPageLoader from "@/components/Shared/FullPageLoader";
import GlobalAlerts from "@/components/Shared/GlobalAlerts";
import GlobalModals from "@/components/Shared/GlobalModals";
import Navbar from "@/components/Shared/Navbar";
import BottomNavigation from "@/components/Shared/Navbar/BottomNavigation";
import { Spinner } from "@/components/Shared/UI";
import { ADMIN_GROUP_ADDRESS } from "@/data/constants";
import reloadAllTabs from "@/helpers/reloadAllTabs";
import useShareTargetListener from "@/hooks/useShareTargetListener";
import { useTheme } from "@/hooks/useTheme";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { hydrateAuthTokens, signOut } from "@/store/persisted/useAuthStore";
import ReloadTabsWatcher from "./ReloadTabsWatcher";

const Layout = () => {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const { currentAccount, setCurrentAccount, setIsSignless } =
    useAccountStore();
  const isMounted = useIsClient();
  const { accessToken } = hydrateAuthTokens();
  const { setBannedAccounts } = useBannedAccountsStore();

  useShareTargetListener();

  useEffect(() => {
    if (pathname === "/") return; // let CachedWindowVirtualizer handle scroll restoration on home page
    window.scrollTo(0, 0);
  }, [pathname]);

  const onError = useCallback(() => {
    signOut();
    reloadAllTabs();
  }, []);

  const { loading } = useMeQuery({
    onCompleted: ({ me }) => {
      setCurrentAccount(me.loggedInAs.account);
      setIsSignless(me.isSignless);
    },
    onError,
    skip: !accessToken
  });

  useGroupBannedAccountsQuery({
    fetchPolicy: "network-only",
    onCompleted: ({ groupBannedAccounts }) => {
      setBannedAccounts(
        groupBannedAccounts.items.map((item) => item.account.address)
      );
    },
    variables: {
      request: {
        group: ADMIN_GROUP_ADDRESS,
        pageSize: PageSize.Fifty
      }
    }
  });

  const accountLoading = !currentAccount && loading;

  if (accountLoading || !isMounted) {
    return <FullPageLoader />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <Toaster
        icons={{
          error: <XCircleIcon className="size-5" />,
          loading: <Spinner size="xs" />,
          success: <CheckCircleIcon className="size-5" />
        }}
        position="bottom-right"
        theme={theme as ToasterProps["theme"]}
        toastOptions={{
          className: "font-sofia-pro",
          style: { boxShadow: "none", fontSize: "16px" }
        }}
      />
      <GlobalModals />
      <GlobalAlerts />
      <ReloadTabsWatcher />
      <div className="mx-auto flex w-full max-w-6xl items-start gap-x-6 px-0 md:px-5">
        <Navbar />
        <Outlet />
        <BottomAudioPlayer />
        <BottomNavigation />
      </div>
    </LazyMotion>
  );
};

export default memo(Layout);

import { useNotificationIndicatorQuery } from "@palus/indexer";
import { useVisibilityChange } from "@uidotdev/usehooks";
import { useMemo } from "react";
import { getNotificationTimestamp } from "@/helpers/getNotificationTimestamp";
import { useIntervalWhen } from "@/hooks/useIntervalWhen";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";
import type { AnyNotificationFragment } from "@/types/palus";

const setAppBadge = (count: number) => {
  if ("setAppBadge" in navigator) {
    navigator.setAppBadge(count).catch();
  }
};

const useHasNewNotifications = () => {
  const { currentAccount } = useAccountStore();
  const { getLastSeenNotificationTimestamp } = useNotificationStore();
  const { includeLowScore } = usePreferencesStore();
  const documentVisible = useVisibilityChange();

  const lastSeenNotificationTimestamp = getLastSeenNotificationTimestamp(
    currentAccount?.address
  );

  const { data, refetch } = useNotificationIndicatorQuery({
    fetchPolicy: "no-cache",
    skip: !currentAccount,
    variables: { request: { filter: { includeLowScore } } }
  });

  useIntervalWhen(refetch, {
    ms: 60 * 1000,
    startImmediately: true,
    when: documentVisible
  });

  return useMemo(() => {
    if (!currentAccount) {
      setAppBadge(0);
      return false;
    }

    const newNotifications = data?.notifications.items.filter(
      (n) =>
        getNotificationTimestamp(n as AnyNotificationFragment) >
        (lastSeenNotificationTimestamp ?? new Date().toISOString())
    );

    const count = newNotifications?.length ?? 0;
    setAppBadge(count);

    return count > 0;
  }, [currentAccount, data, lastSeenNotificationTimestamp]);
};

export default useHasNewNotifications;

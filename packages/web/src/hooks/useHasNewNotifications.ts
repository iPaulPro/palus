import { useNotificationIndicatorQuery } from "@palus/indexer";
import { useVisibilityChange } from "@uidotdev/usehooks";
import { getNotificationTimestamp } from "@/helpers/getNotificationTimestamp";
import { useIntervalWhen } from "@/hooks/useIntervalWhen";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const useHasNewNotifications = () => {
  const { currentAccount } = useAccountStore();
  const { lastSeenNotificationTimestamp } = useNotificationStore();
  const { includeLowScore } = usePreferencesStore();
  const documentVisible = useVisibilityChange();

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

  const latestNotification = data?.notifications?.items[0];
  if (!latestNotification || !currentAccount) {
    navigator.clearAppBadge().catch();
    return false;
  }

  const latestTimestamp = getNotificationTimestamp(latestNotification);
  if (!latestTimestamp) {
    navigator.clearAppBadge().catch();
    return false;
  }

  const hasNew =
    new Date(latestTimestamp) > new Date(lastSeenNotificationTimestamp);
  if (hasNew) {
    navigator.setAppBadge().catch();
  } else {
    navigator.clearAppBadge().catch();
  }
  return hasNew;
};

export default useHasNewNotifications;

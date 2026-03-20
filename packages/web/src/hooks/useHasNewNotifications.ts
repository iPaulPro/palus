import { useNotificationIndicatorQuery } from "@palus/indexer";
import { getNotificationTimestamp } from "@/helpers/getNotificationTimestamp";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const useHasNewNotifications = () => {
  const { currentAccount } = useAccountStore();
  const { lastSeenNotificationTimestamp } = useNotificationStore();
  const { includeLowScore } = usePreferencesStore();

  const { data } = useNotificationIndicatorQuery({
    fetchPolicy: "no-cache",
    pollInterval: 60 * 1000,
    skip: !currentAccount,
    variables: { request: { filter: { includeLowScore } } }
  });

  const latestNotification = data?.notifications?.items[0];
  if (!latestNotification || !currentAccount) {
    return false;
  }

  const latestTimestamp = getNotificationTimestamp(latestNotification);
  if (!latestTimestamp) {
    return false;
  }

  return new Date(latestTimestamp) > new Date(lastSeenNotificationTimestamp);
};

export default useHasNewNotifications;

import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  lastSeenNotificationTimestamp: string;
  notificationRefreshSignal: number;
  setLastSeenNotificationTimestamp: (timestamp: string) => void;
  incrementNotificationRefreshSignal: () => void;
}

const { useStore: useNotificationStore } = createPersistedTrackedStore<State>(
  (set) => ({
    incrementNotificationRefreshSignal: () =>
      set((state) => ({
        notificationRefreshSignal: state.notificationRefreshSignal + 1
      })),
    lastSeenNotificationTimestamp: new Date().toISOString(),
    notificationRefreshSignal: 0,
    setLastSeenNotificationTimestamp: (timestamp) =>
      set(() => ({ lastSeenNotificationTimestamp: timestamp }))
  }),
  { name: Localstorage.NotificationStore }
);

export { useNotificationStore };

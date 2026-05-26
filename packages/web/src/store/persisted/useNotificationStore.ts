import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  lastSeenNotificationTimestamps: Record<string, string>;
  notificationRefreshSignal: number;
  getLastSeenNotificationTimestamp: (address: string) => string | undefined;
  setLastSeenNotificationTimestamp: (
    address: string,
    timestamp: string
  ) => void;
  incrementNotificationRefreshSignal: () => void;
}

const { useStore: useNotificationStore } = createPersistedTrackedStore<State>(
  (set, get) => ({
    getLastSeenNotificationTimestamp: (address) =>
      get().lastSeenNotificationTimestamps[address],
    incrementNotificationRefreshSignal: () =>
      set((state) => ({
        notificationRefreshSignal: state.notificationRefreshSignal + 1
      })),
    lastSeenNotificationTimestamps: {},
    notificationRefreshSignal: 0,
    setLastSeenNotificationTimestamp: (address, timestamp) =>
      set((state) => ({
        lastSeenNotificationTimestamps: {
          ...state.lastSeenNotificationTimestamps,
          [address]: timestamp
        }
      }))
  }),
  { name: Localstorage.NotificationStore }
);

export { useNotificationStore };

import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  lastSeenNotificationTimestamps: Record<string, string>;
  notificationRefreshSignal: number;
  getLastSeenNotificationTimestamp: (address: string) => string;
  setLastSeenNotificationTimestamp: (
    address: string,
    timestamp: string
  ) => void;
  incrementNotificationRefreshSignal: () => void;
}

const { useStore: useNotificationStore } = createPersistedTrackedStore<State>(
  (set, get) => ({
    getLastSeenNotificationTimestamp: (address) =>
      get().lastSeenNotificationTimestamps[address] ?? new Date().toISOString(),
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

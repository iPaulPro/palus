import type { AccountFragment } from "@palus/indexer";
import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  currentAccount?: AccountFragment;
  setCurrentAccount: (currentAccount?: AccountFragment) => void;
  isSignless: boolean;
  setIsSignless: (isSignless: boolean) => void;
}

const { useStore: useAccountStore } = createPersistedTrackedStore<State>(
  (set, _get) => ({
    currentAccount: undefined,
    isSignless: false,
    setCurrentAccount: (currentAccount?: AccountFragment) =>
      set(() => ({ currentAccount })),
    setIsSignless: (isSignless: boolean) => set(() => ({ isSignless }))
  }),
  { name: Localstorage.AccountStore }
);

export { useAccountStore };

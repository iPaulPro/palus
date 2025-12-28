import { Localstorage } from "@palus/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  includeLowScore: boolean;
  setIncludeLowScore: (includeLowScore: boolean) => void;
}

const { useStore: usePreferencesStore } = createPersistedTrackedStore<State>(
  (set) => ({
    includeLowScore: false,
    setIncludeLowScore: (includeLowScore) => set(() => ({ includeLowScore }))
  }),
  { name: Localstorage.PreferencesStore }
);

export { usePreferencesStore };

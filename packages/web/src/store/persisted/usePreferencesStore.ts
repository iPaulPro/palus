import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  includeLowScore: boolean;
  replaceLensLinks: boolean;
  setIncludeLowScore: (includeLowScore: boolean) => void;
  setReplaceLensLinks: (replaceLensLinks: boolean) => void;
}

const { useStore: usePreferencesStore } = createPersistedTrackedStore<State>(
  (set) => ({
    includeLowScore: false,
    replaceLensLinks: true,
    setIncludeLowScore: (includeLowScore) => set(() => ({ includeLowScore })),
    setReplaceLensLinks: (replaceLensLinks) => set(() => ({ replaceLensLinks }))
  }),
  { name: Localstorage.PreferencesStore }
);

export { usePreferencesStore };

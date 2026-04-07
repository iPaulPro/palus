import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  includeCommentsInTimeline: boolean;
  includeLowScore: boolean;
  replaceLensLinks: boolean;
  showInstallPrompt: boolean;
  setIncludeCommentsInTimeline: (includeCommentsInTimeline: boolean) => void;
  setIncludeLowScore: (includeLowScore: boolean) => void;
  setReplaceLensLinks: (replaceLensLinks: boolean) => void;
  setShowInstallPrompt: (showInstallPrompt: boolean) => void;
}

const { useStore: usePreferencesStore } = createPersistedTrackedStore<State>(
  (set) => ({
    includeCommentsInTimeline: true,
    includeLowScore: false,
    replaceLensLinks: true,
    setIncludeCommentsInTimeline: (includeCommentsInFeed) =>
      set(() => ({ includeCommentsInTimeline: includeCommentsInFeed })),
    setIncludeLowScore: (includeLowScore) => set(() => ({ includeLowScore })),
    setReplaceLensLinks: (replaceLensLinks) =>
      set(() => ({ replaceLensLinks })),
    setShowInstallPrompt: (showInstallPrompt: boolean) =>
      set(() => ({ showInstallPrompt })),
    showInstallPrompt: true
  }),
  { name: Localstorage.PreferencesStore }
);

export { usePreferencesStore };

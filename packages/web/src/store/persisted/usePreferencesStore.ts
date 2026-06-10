import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  includeCommentsInTimeline: boolean;
  includeLowScore: boolean;
  replaceLensLinks: boolean;
  showInstallPrompt: boolean;
  hideShareImagePosts: boolean;
  hideHeyPosts: boolean;
  setIncludeCommentsInTimeline: (includeCommentsInTimeline: boolean) => void;
  setIncludeLowScore: (includeLowScore: boolean) => void;
  setReplaceLensLinks: (replaceLensLinks: boolean) => void;
  setShowInstallPrompt: (showInstallPrompt: boolean) => void;
  setHideShareImagePosts: (hideShareImagePosts: boolean) => void;
  setHideHeyPosts: (hideHeyPosts: boolean) => void;
}

const { useStore: usePreferencesStore } = createPersistedTrackedStore<State>(
  (set) => ({
    hideHeyPosts: false,
    hideShareImagePosts: false,
    includeCommentsInTimeline: true,
    includeLowScore: false,
    replaceLensLinks: true,
    setHideHeyPosts: (hideHeyPosts: boolean) => set(() => ({ hideHeyPosts })),
    setHideShareImagePosts: (hideShareImagePosts) =>
      set(() => ({ hideShareImagePosts })),
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

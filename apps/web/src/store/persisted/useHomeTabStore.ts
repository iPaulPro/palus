import { HomeFeedType } from "@/data/enums";
import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  feedType: HomeFeedType;
  setFeedType: (feedType: HomeFeedType) => void;
}

const { useStore: useHomeTabStore } = createPersistedTrackedStore<State>(
  (set) => ({
    feedType: HomeFeedType.TIMELINE,
    setFeedType: (feedType) => set(() => ({ feedType }))
  }),
  { name: Localstorage.HomeTabStore }
);

export { useHomeTabStore };

import { HomeFeedType } from "@palus/data/enums";
import { Localstorage } from "@palus/data/storage";
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

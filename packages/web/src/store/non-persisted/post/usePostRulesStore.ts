import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  collectorsOnly: boolean;
  followersOnly: boolean;
  followingOnly: boolean;
  groupGate?: string;
  setCollectorsOnly: (collectorsOnly: boolean) => void;
  setFollowersOnly: (followersOnly: boolean) => void;
  setFollowingOnly: (followingOnly: boolean) => void;
  setGroupGate: (groupGate?: string) => void;
}

const { useStore: usePostRulesStore } = createTrackedStore<State>((set) => ({
  collectorsOnly: false,
  followersOnly: false,
  followingOnly: false,
  groupGate: undefined,
  setCollectorsOnly: (collectorsOnly: boolean) =>
    set(() => ({ collectorsOnly })),
  setFollowersOnly: (followersOnly: boolean) => set(() => ({ followersOnly })),
  setFollowingOnly: (followingOnly: boolean) => set(() => ({ followingOnly })),
  setGroupGate: (groupGate?: string) => set(() => ({ groupGate }))
}));

export { usePostRulesStore };

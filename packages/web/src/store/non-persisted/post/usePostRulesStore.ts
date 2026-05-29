import { createTrackedStore } from "@/store/createTrackedStore";

export interface RuleState {
  repliesRestricted: boolean;
  repostsRestricted: boolean;
  quotesRestricted: boolean;
}

interface State {
  collectorsOnly?: RuleState;
  followersOnly?: RuleState;
  followingOnly?: RuleState;
  groupGate?: string;
  setCollectorsOnly: (collectorsOnly?: RuleState) => void;
  setFollowersOnly: (followersOnly?: RuleState) => void;
  setFollowingOnly: (followingOnly?: RuleState) => void;
  setGroupGate: (groupGate?: string) => void;
}

const { useStore: usePostRulesStore } = createTrackedStore<State>((set) => ({
  collectorsOnly: undefined,
  followersOnly: undefined,
  followingOnly: undefined,
  groupGate: undefined,
  setCollectorsOnly: (collectorsOnly?: RuleState) =>
    set(() => ({ collectorsOnly })),
  setFollowersOnly: (followersOnly?: RuleState) =>
    set(() => ({ followersOnly })),
  setFollowingOnly: (followingOnly?: RuleState) =>
    set(() => ({ followingOnly })),
  setGroupGate: (groupGate?: string) => set(() => ({ groupGate }))
}));

export { usePostRulesStore };

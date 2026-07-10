import { create } from "zustand";
import type { CollectActionType } from "@/types/palus";

const INITIAL_COLLECT_ACTION: CollectActionType = {
  collectLimit: null,
  enabled: false,
  endsAt: null,
  followerOnly: false,
  license: null,
  payToCollect: undefined
};

interface State {
  collectAction: CollectActionType;
  reset: () => void;
  setCollectAction: (collectAction: CollectActionType) => void;
  updateCollectAction: (data: Partial<CollectActionType>) => void;
}

const store = create<State>((set) => ({
  collectAction: INITIAL_COLLECT_ACTION,
  reset: () => set(() => ({ collectAction: INITIAL_COLLECT_ACTION })),
  setCollectAction: (collectAction) => set(() => ({ collectAction })),
  updateCollectAction: (data) =>
    set((state) => ({ collectAction: { ...state.collectAction, ...data } }))
}));

export const useCollectActionStore = store;

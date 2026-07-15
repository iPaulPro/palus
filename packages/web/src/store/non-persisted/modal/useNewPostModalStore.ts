import type { ComposerInitialState } from "@/components/Composer/ComposerStore";
import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  close: () => void;
  initialState: ComposerInitialState;
  open: (initialState?: ComposerInitialState) => void;
  sessionId: number;
  show: boolean;
}

const { useStore: useNewPostModalStore } = createTrackedStore<State>((set) => ({
  close: () => set({ initialState: {}, show: false }),
  initialState: {},
  open: (initialState = {}) =>
    set((state) => ({
      initialState,
      sessionId: state.sessionId + 1,
      show: true
    })),
  sessionId: 0,
  show: false
}));

export { useNewPostModalStore };

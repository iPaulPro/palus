import type { PostFragment } from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  showPinPostModal: boolean;
  post?: PostFragment;
  isPinned: boolean;
  setShowPinPostModal: (
    showPinPostModal: boolean,
    post?: PostFragment,
    isPinned?: boolean
  ) => void;
}

const { useStore: usePinPostModalStore } = createTrackedStore<State>((set) => ({
  isPinned: false,
  pinnedPostId: undefined,
  post: undefined,
  setShowPinPostModal: (showPinPostModal, post, isPinned) =>
    set(() => ({ isPinned, post, showPinPostModal })),
  showPinPostModal: false
}));

export { usePinPostModalStore };

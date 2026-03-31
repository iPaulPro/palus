import { createTrackedStore } from "@/store/createTrackedStore";
import type { PostDraft } from "@/types/draft";

interface State {
  draft?: PostDraft;
  showDraftModal: boolean;
  setShowDraftModal: (showDraftModal: boolean, draft?: PostDraft) => void;
}

const { useStore: useDraftModalStore } = createTrackedStore<State>((set) => ({
  draft: undefined,
  setShowDraftModal: (showDraftModal, draft) =>
    set(() => ({ draft, showDraftModal })),
  showDraftModal: false
}));

export { useDraftModalStore };

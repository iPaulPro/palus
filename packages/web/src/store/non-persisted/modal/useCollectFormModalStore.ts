import { createTrackedStore } from "@/store/createTrackedStore";
import type { CollectActionType } from "@/types/palus";

interface State {
  showCollectFormModal: boolean;
  submittingPost?: string;
  onSubmit?: (values: CollectActionType) => void;
  setShowCollectFormModal: (
    showCollectFormModal: boolean,
    onSubmit?: (values: CollectActionType) => void
  ) => void;
  setSubmittingPost: (submittingPost?: string) => void;
}

const { useStore: useCollectFormModalStore } = createTrackedStore<State>(
  (set) => ({
    onSubmit: undefined,
    setShowCollectFormModal: (showCollectFormModal, onSubmit) =>
      set(() => ({ onSubmit, showCollectFormModal })),
    setSubmittingPost: (submittingPost) => set(() => ({ submittingPost })),
    showCollectFormModal: false,
    submittingPost: undefined
  })
);

export { useCollectFormModalStore };

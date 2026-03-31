import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";
import type { PostDraft } from "@/types/draft";

interface State {
  drafts: Record<string, PostDraft>;
  saveDraft: (draft: PostDraft) => void;
  removeDraft: (id: string) => void;
}

const { store, useStore: useDraftStore } = createPersistedTrackedStore<State>(
  (set) => ({
    drafts: {},
    removeDraft: (id) =>
      set((state) => {
        const { [id]: _, ...rest } = state.drafts;
        return { drafts: rest };
      }),
    saveDraft: (draft) =>
      set((state) => ({
        drafts: { ...state.drafts, [draft.id]: draft }
      }))
  }),
  { name: Localstorage.DraftStore }
);

export { store as draftStoreInstance, useDraftStore };

import type { PostFragment } from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  postContent: string;
  quotedPost?: PostFragment;
  editingPost?: PostFragment;
  parentPost?: PostFragment;
  setPostContent: (postContent: string) => void;
  setQuotedPost: (quotedPost?: PostFragment) => void;
  setEditingPost: (editingPost?: PostFragment) => void;
  setParentPost: (parentPost?: PostFragment) => void;
}

const { useStore: usePostStore } = createTrackedStore<State>((set) => ({
  editingPost: undefined,
  parentPost: undefined,
  postContent: "",
  quotedPost: undefined,
  setEditingPost: (editingPost) => set(() => ({ editingPost })),
  setParentPost: (parentPost) => set(() => ({ parentPost })),
  setPostContent: (postContent) => set(() => ({ postContent })),
  setQuotedPost: (quotedPost) => set(() => ({ quotedPost }))
}));

export { usePostStore };

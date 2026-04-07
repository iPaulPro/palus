import type { PostFragment } from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";
import type { ShareAction } from "@/types/palus";

interface State {
  postContent: string;
  quotedPost?: PostFragment;
  editingPost?: PostFragment;
  parentPost?: PostFragment;
  ignoreQuotedPostId?: string;
  notificationShare?: ShareAction;
  setPostContent: (postContent: string) => void;
  setQuotedPost: (quotedPost?: PostFragment) => void;
  setEditingPost: (editingPost?: PostFragment) => void;
  setParentPost: (parentPost?: PostFragment) => void;
  setIgnoreQuotedPostId: (ignoreQuotedPostId?: string) => void;
  setNotificationShare: (notificationShare?: ShareAction) => void;
}

const { useStore: usePostStore } = createTrackedStore<State>((set) => ({
  editingPost: undefined,
  ignoreQuotedPost: undefined,
  notificationShare: undefined,
  parentPost: undefined,
  postContent: "",
  quotedPost: undefined,
  setEditingPost: (editingPost) => set(() => ({ editingPost })),
  setIgnoreQuotedPostId: (ignoreQuotedPostId) =>
    set(() => ({ ignoreQuotedPostId })),
  setNotificationShare: (notificationShare) =>
    set(() => ({ notificationShare })),
  setParentPost: (parentPost) => set(() => ({ parentPost })),
  setPostContent: (postContent) => set(() => ({ postContent })),
  setQuotedPost: (quotedPost) => set(() => ({ quotedPost }))
}));

export { usePostStore };

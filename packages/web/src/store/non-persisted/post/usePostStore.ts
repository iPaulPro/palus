import type { ContentWarning, PostFragment } from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";
import type { ShareAction } from "@/types/palus";

interface State {
  postContent: string;
  quotedPost?: PostFragment;
  editingPost?: PostFragment;
  parentPost?: PostFragment;
  ignoreQuotedPostId?: string;
  notificationShare?: ShareAction;
  sharingLink?: string;
  contentWarning?: ContentWarning;
  setPostContent: (postContent: string) => void;
  setQuotedPost: (quotedPost?: PostFragment) => void;
  setEditingPost: (editingPost?: PostFragment) => void;
  setParentPost: (parentPost?: PostFragment) => void;
  setIgnoreQuotedPostId: (ignoreQuotedPostId?: string) => void;
  setNotificationShare: (notificationShare?: ShareAction) => void;
  setSharingLink: (sharingLink?: string) => void;
  setContentWarning: (warning?: ContentWarning) => void;
}

const { useStore: usePostStore } = createTrackedStore<State>((set) => ({
  contentWarning: undefined,
  editingPost: undefined,
  ignoreQuotedPost: undefined,
  notificationShare: undefined,
  parentPost: undefined,
  postContent: "",
  quotedPost: undefined,
  setContentWarning: (contentWarning) => set(() => ({ contentWarning })),
  setEditingPost: (editingPost) => set(() => ({ editingPost })),
  setIgnoreQuotedPostId: (ignoreQuotedPostId) =>
    set(() => ({ ignoreQuotedPostId })),
  setNotificationShare: (notificationShare) =>
    set(() => ({ notificationShare })),
  setParentPost: (parentPost) => set(() => ({ parentPost })),
  setPostContent: (postContent) => set(() => ({ postContent })),
  setQuotedPost: (quotedPost) => set(() => ({ quotedPost })),
  setSharingLink: (sharingLink) => set(() => ({ sharingLink })),
  sharingLink: undefined
}));

export { usePostStore };

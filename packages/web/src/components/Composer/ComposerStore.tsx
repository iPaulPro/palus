import type { ContentWarning, PostFragment } from "@palus/indexer";
import { createContext, type ReactNode, useContext, useState } from "react";
import { createStore, type StoreApi, useStore } from "zustand";
import { DEFAULT_DURATION_DAYS } from "@/helpers/pollActionParams";
import type { NewAttachment } from "@/types/misc";
import type { CollectActionType, PollConfig, ShareAction } from "@/types/palus";

export interface AudioPost {
  artist: string;
  cover: string;
  duration: number;
  mimeType: string;
  title: string;
}

export interface VideoThumbnail {
  mimeType: string;
  uploading: boolean;
  url: string;
}

export interface RuleState {
  repliesRestricted: boolean;
  repostsRestricted: boolean;
  quotesRestricted: boolean;
}

export const DEFAULT_AUDIO_POST: AudioPost = {
  artist: "",
  cover: "",
  duration: 0,
  mimeType: "",
  title: ""
};

export const DEFAULT_VIDEO_THUMBNAIL: VideoThumbnail = {
  mimeType: "",
  uploading: false,
  url: ""
};

const createInitialComposerState = () => ({
  attachments: [] as NewAttachment[],
  audioPost: { ...DEFAULT_AUDIO_POST },
  collectAction: {
    collectLimit: null,
    enabled: false,
    endsAt: null,
    followerOnly: false,
    license: null,
    payToCollect: undefined
  } as CollectActionType,
  collectorsOnly: undefined as RuleState | undefined,
  contentWarning: undefined as ContentWarning | undefined,
  editingPost: undefined as PostFragment | undefined,
  followersOnly: undefined as RuleState | undefined,
  followingOnly: undefined as RuleState | undefined,
  groupGate: undefined as string | undefined,
  ignoreQuotedPostId: undefined as string | undefined,
  isUploading: false,
  notificationShare: undefined as ShareAction | undefined,
  parentPost: undefined as PostFragment | undefined,
  pollConfig: {
    allowMultipleAnswers: false,
    durationInDays: DEFAULT_DURATION_DAYS,
    options: ["", ""]
  } as PollConfig,
  postContent: "",
  quotedPost: undefined as PostFragment | undefined,
  sharingLink: undefined as string | undefined,
  showPollEditor: false,
  videoDurationInSeconds: "",
  videoThumbnail: { ...DEFAULT_VIDEO_THUMBNAIL }
});

type ComposerDraftState = ReturnType<typeof createInitialComposerState>;

export interface ComposerInitialState extends Partial<ComposerDraftState> {}

interface ComposerState extends ComposerDraftState {
  addAttachments: (attachments: NewAttachment[]) => void;
  addPollOption: () => void;
  removeAttachments: (ids: string[]) => void;
  removePollOption: (index: number) => void;
  reset: () => void;
  resetCollectAction: () => void;
  resetPollConfig: () => void;
  setAttachments: (attachments: NewAttachment[]) => void;
  setAudioPost: (audioPost: AudioPost) => void;
  setCollectAction: (collectAction: CollectActionType) => void;
  setCollectorsOnly: (collectorsOnly?: RuleState) => void;
  setContentWarning: (contentWarning?: ContentWarning) => void;
  setEditingPost: (editingPost?: PostFragment) => void;
  setFollowersOnly: (followersOnly?: RuleState) => void;
  setFollowingOnly: (followingOnly?: RuleState) => void;
  setGroupGate: (groupGate?: string) => void;
  setIgnoreQuotedPostId: (ignoreQuotedPostId?: string) => void;
  setIsUploading: (isUploading: boolean) => void;
  setNotificationShare: (notificationShare?: ShareAction) => void;
  setParentPost: (parentPost?: PostFragment) => void;
  setPollConfig: (pollConfig: PollConfig) => void;
  setPostContent: (postContent: string) => void;
  setQuotedPost: (quotedPost?: PostFragment) => void;
  setSharingLink: (sharingLink?: string) => void;
  setShowPollEditor: (showPollEditor: boolean) => void;
  setVideoDurationInSeconds: (videoDurationInSeconds: string) => void;
  setVideoThumbnail: (videoThumbnail: VideoThumbnail) => void;
  updateAttachments: (attachments: NewAttachment[]) => void;
  updateAudioPost: (audioPost: Partial<AudioPost>) => void;
  updateCollectAction: (collectAction: Partial<CollectActionType>) => void;
  updatePollConfig: (pollConfig: Partial<PollConfig>) => void;
  updatePollOption: (index: number, value: string) => void;
  updateVideoThumbnail: (videoThumbnail: Partial<VideoThumbnail>) => void;
}

export const createComposerStore = (
  initialState: ComposerInitialState = {}
): StoreApi<ComposerState> =>
  createStore<ComposerState>()((set) => ({
    ...createInitialComposerState(),
    ...initialState,
    addAttachments: (newAttachments) =>
      set((state) => ({
        attachments: [...state.attachments, ...newAttachments]
      })),
    addPollOption: () =>
      set((state) => ({
        pollConfig: {
          ...state.pollConfig,
          options: [...state.pollConfig.options, ""]
        }
      })),
    removeAttachments: (ids) => {
      const idsToRemove = new Set(ids);
      set((state) => ({
        attachments: state.attachments.filter((attachment) => {
          return !idsToRemove.has(attachment.id ?? "");
        })
      }));
    },
    removePollOption: (index) =>
      set((state) => ({
        pollConfig: {
          ...state.pollConfig,
          options: state.pollConfig.options.filter((_, optionIndex) => {
            return optionIndex !== index;
          })
        }
      })),
    reset: () => set(createInitialComposerState()),
    resetCollectAction: () =>
      set(() => ({
        collectAction: createInitialComposerState().collectAction
      })),
    resetPollConfig: () =>
      set(() => ({
        pollConfig: {
          allowMultipleAnswers: false,
          durationInDays: DEFAULT_DURATION_DAYS,
          options: ["", ""]
        }
      })),
    setAttachments: (attachments) => set({ attachments }),
    setAudioPost: (audioPost) => set({ audioPost }),
    setCollectAction: (collectAction) => set({ collectAction }),
    setCollectorsOnly: (collectorsOnly) => set({ collectorsOnly }),
    setContentWarning: (contentWarning) => set({ contentWarning }),
    setEditingPost: (editingPost) => set({ editingPost }),
    setFollowersOnly: (followersOnly) => set({ followersOnly }),
    setFollowingOnly: (followingOnly) => set({ followingOnly }),
    setGroupGate: (groupGate) => set({ groupGate }),
    setIgnoreQuotedPostId: (ignoreQuotedPostId) => set({ ignoreQuotedPostId }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setNotificationShare: (notificationShare) => set({ notificationShare }),
    setParentPost: (parentPost) => set({ parentPost }),
    setPollConfig: (pollConfig) => set({ pollConfig }),
    setPostContent: (postContent) => set({ postContent }),
    setQuotedPost: (quotedPost) => set({ quotedPost }),
    setSharingLink: (sharingLink) => set({ sharingLink }),
    setShowPollEditor: (showPollEditor) => set({ showPollEditor }),
    setVideoDurationInSeconds: (videoDurationInSeconds) =>
      set({ videoDurationInSeconds }),
    setVideoThumbnail: (videoThumbnail) => set({ videoThumbnail }),
    updateAttachments: (updatedAttachments) =>
      set((state) => ({
        attachments: state.attachments.map((attachment) => {
          return (
            updatedAttachments.find(
              (updatedAttachment) => updatedAttachment.id === attachment.id
            ) ?? attachment
          );
        })
      })),
    updateAudioPost: (audioPost) =>
      set((state) => ({
        audioPost: { ...state.audioPost, ...audioPost }
      })),
    updateCollectAction: (collectAction) =>
      set((state) => ({
        collectAction: { ...state.collectAction, ...collectAction }
      })),
    updatePollConfig: (pollConfig) =>
      set((state) => ({
        pollConfig: { ...state.pollConfig, ...pollConfig }
      })),
    updatePollOption: (index, value) =>
      set((state) => {
        const options = [...state.pollConfig.options];
        options[index] = value;
        return { pollConfig: { ...state.pollConfig, options } };
      }),
    updateVideoThumbnail: (videoThumbnail) =>
      set((state) => ({
        videoThumbnail: { ...state.videoThumbnail, ...videoThumbnail }
      }))
  }));

type ComposerStore = StoreApi<ComposerState>;

const ComposerStoreContext = createContext<ComposerStore | null>(null);
const fallbackComposerStore = createComposerStore();

interface ComposerStoreProviderProps {
  children: ReactNode;
  initialState?: ComposerInitialState;
}

export const ComposerStoreProvider = ({
  children,
  initialState
}: ComposerStoreProviderProps) => {
  const [store] = useState(() => createComposerStore(initialState));

  return (
    <ComposerStoreContext.Provider value={store}>
      {children}
    </ComposerStoreContext.Provider>
  );
};

export const useComposerStore = <Value,>(
  selector: (state: ComposerState) => Value
): Value => {
  const store = useContext(ComposerStoreContext);

  if (!store) {
    throw new Error(
      "useComposerStore must be used within a ComposerStoreProvider"
    );
  }

  return useStore(store, selector);
};

export const useOptionalComposerStore = <Value,>(
  selector: (state: ComposerState) => Value
): Value => {
  const store = useContext(ComposerStoreContext) ?? fallbackComposerStore;
  return useStore(store, selector);
};

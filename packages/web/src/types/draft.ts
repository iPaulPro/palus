import type {
  ContentWarning,
  GroupFragment,
  MetadataLicenseType,
  PostFragment
} from "@palus/indexer";
import type { PollConfig } from "@/store/non-persisted/post/usePostPollStore";
import type { NewAttachment } from "@/types/misc";
import type { CollectActionType } from "@/types/palus";

export interface DraftAttachment {
  id?: string;
  mimeType: string;
  previewUri: string;
  type: "Audio" | "Image" | "Video";
  uri?: string;
}

export interface DraftAudioPost {
  artist: string;
  cover: string;
  mimeType: string;
  title: string;
}

export interface DraftVideoThumbnail {
  mimeType: string;
  url: string;
}

export interface PostDraft {
  id: string;
  createdAt: number;
  updatedAt: number;

  // Post content
  postContent: string;

  // Attachments (without File objects since they can't be serialized)
  attachments: DraftAttachment[];

  // Audio metadata
  audioPost: DraftAudioPost;

  // Video metadata
  videoThumbnail: DraftVideoThumbnail;
  videoDurationInSeconds: string;

  // References
  quotedPost?: PostFragment;
  parentPost?: PostFragment;
  group?: GroupFragment;

  // Content warning
  contentWarning?: ContentWarning;

  // Poll
  pollConfig: PollConfig;
  showPollEditor: boolean;

  // Collect action
  collectAction: CollectActionType;

  // License
  license: MetadataLicenseType | null;

  // Rules
  collectorsOnly: boolean;
  followersOnly: boolean;
  followingOnly: boolean;
  groupGate?: string;
}

export const toDraftAttachment = (
  attachment: NewAttachment
): DraftAttachment => ({
  id: attachment.id,
  mimeType: attachment.mimeType,
  previewUri: attachment.previewUri,
  type: attachment.type,
  uri: attachment.uri
});

export const toNewAttachment = (
  attachment: DraftAttachment
): NewAttachment => ({
  id: attachment.id,
  mimeType: attachment.mimeType,
  previewUri: attachment.previewUri,
  type: attachment.type,
  uri: attachment.uri
});

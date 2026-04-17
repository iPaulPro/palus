import type { MediaAudioType, PostMentionFragment } from "@palus/indexer";

export interface NewAttachment {
  file?: File;
  id?: string;
  mimeType: string;
  previewUri: string;
  type: "Audio" | "Image" | "Video";
  uri?: string;
}

export interface Emoji {
  /**
   * Aliases for the emoji, e.g. ["smile", "happy"] for 😀
   */
  a: string[];
  /**
   * Description of the emoji, e.g. "grinning face" for 😀
   */
  d: string;
  /**
   * The emoji character itself, e.g. "😀"
   */
  e: string;
  /**
   * Optional tags for the emoji, e.g. ["face", "grin"] for 😀
   */
  t?: string[];
}

export interface MarkupLinkProps {
  mentions?: PostMentionFragment[];
  title?: string;
}

export interface AttachmentData {
  artist?: string | null;
  coverUri?: string;
  kind: "Audio" | "Image" | "Video";
  uri: string;
  title?: string;
  type?: MediaAudioType;
}

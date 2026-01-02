import type { PostMentionFragment } from "@palus/indexer";

export interface NewAttachment {
  file?: File;
  id?: string;
  mimeType: string;
  previewUri: string;
  type: "Audio" | "Image" | "Video";
  uri?: string;
}

export interface Emoji {
  aliases: string[];
  category: string;
  description: string;
  emoji: string;
  tags: string[];
}

export interface MarkupLinkProps {
  mentions?: PostMentionFragment[];
  title?: string;
}

export interface AttachmentData {
  artist?: string | null;
  coverUri?: string;
  type: "Audio" | "Image" | "Video";
  uri: string;
  title?: string;
}

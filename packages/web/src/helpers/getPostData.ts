import type {
  ContentWarning,
  MetadataAttribute,
  PostMetadataFragment
} from "@palus/indexer";
import { PLACEHOLDER_IMAGE } from "@/data/constants";
import type { AttachmentData } from "@/types/misc";
import getAttachmentsData from "./getAttachmentsData";
import sanitizeDStorageUrl from "./sanitizeDStorageUrl";

const getPostData = (
  metadata: PostMetadataFragment
): {
  asset?: AttachmentData;
  attachments?: AttachmentData[];
  attributes?: MetadataAttribute[];
  content?: string;
  contentWarning?: ContentWarning | null;
} | null => {
  switch (metadata.__typename) {
    case "ArticleMetadata":
    case "ThreeDMetadata":
    case "LinkMetadata":
    case "EmbedMetadata":
    case "EventMetadata":
    case "TransactionMetadata":
    case "MintMetadata":
    case "LivestreamMetadata":
    case "CheckingInMetadata":
    case "SpaceMetadata":
      return {
        attachments: getAttachmentsData(metadata.attachments),
        attributes: metadata.attributes,
        content: metadata.content,
        contentWarning: metadata.contentWarning
      };
    case "TextOnlyMetadata":
    case "StoryMetadata":
      return {
        attributes: metadata.attributes,
        content: metadata.content,
        contentWarning: metadata.contentWarning
      };
    case "ImageMetadata":
      return {
        asset: {
          kind: "Image",
          type: metadata.image.imageType,
          uri: sanitizeDStorageUrl(metadata.image.item)
        },
        attachments: getAttachmentsData(metadata.attachments),
        attributes: metadata.attributes,
        content: metadata.content,
        contentWarning: metadata.contentWarning
      };
    case "AudioMetadata": {
      const audioAttachments = getAttachmentsData(metadata.attachments)[0];

      return {
        asset: {
          artist:
            metadata.audio.artist ?? audioAttachments?.artist ?? undefined,
          coverUri: sanitizeDStorageUrl(
            metadata.audio.cover ||
              audioAttachments?.coverUri ||
              PLACEHOLDER_IMAGE
          ),
          duration: metadata.audio.duration ?? 0,
          kind: "Audio",
          title: metadata.title || "Untitled",
          type: metadata.audio.audioType,
          uri: metadata.audio.item || audioAttachments?.uri
        },
        attributes: metadata.attributes,
        content: metadata.content,
        contentWarning: metadata.contentWarning
      };
    }
    case "VideoMetadata": {
      const videoAttachments = getAttachmentsData(metadata.attachments)[0];

      return {
        asset: {
          coverUri: sanitizeDStorageUrl(
            metadata.video.cover || videoAttachments?.coverUri
          ),
          kind: "Video",
          type: metadata.video.videoType,
          uri: sanitizeDStorageUrl(metadata.video.item || videoAttachments?.uri)
        },
        attributes: metadata.attributes,
        content: metadata.content,
        contentWarning: metadata.contentWarning
      };
    }
    default:
      return null;
  }
};

export default getPostData;

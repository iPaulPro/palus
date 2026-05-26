import type { PostMetadataFragment } from "@palus/indexer";
import { sanitizeDStorageUrl } from "../helpers/sanitizeDStorageUrl";

const getPostData = (
  metadata: PostMetadataFragment
): {
  content?: string;
  image?: string;
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
    case "StoryMetadata":
    case "TextOnlyMetadata":
      return {
        content: metadata.content
      };
    case "ImageMetadata":
      return {
        content: metadata.content,
        image: sanitizeDStorageUrl(metadata.image.item)
      };
    case "AudioMetadata": {
      return {
        content: metadata.content,
        image: sanitizeDStorageUrl(metadata.audio.cover)
      };
    }
    case "VideoMetadata": {
      return {
        content: metadata.content,
        image: sanitizeDStorageUrl(metadata.video.cover)
      };
    }
    default:
      return null;
  }
};

export default getPostData;

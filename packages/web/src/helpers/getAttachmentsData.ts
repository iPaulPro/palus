import type { AnyMediaFragment, Maybe } from "@palus/indexer";
import type { AttachmentData } from "@/types/misc";
import sanitizeDStorageUrl from "./sanitizeDStorageUrl";

const getAttachmentsData = (
  attachments?: Maybe<AnyMediaFragment[]>
): AttachmentData[] => {
  if (!attachments) {
    return [];
  }

  return attachments.map((attachment) => {
    switch (attachment.__typename) {
      case "MediaImage":
        return {
          kind: "Image",
          uri: sanitizeDStorageUrl(attachment.item)
        } satisfies AttachmentData;
      case "MediaVideo":
        return {
          coverUri: sanitizeDStorageUrl(attachment.cover),
          kind: "Video",
          uri: sanitizeDStorageUrl(attachment.item)
        } satisfies AttachmentData;
      case "MediaAudio":
        return {
          artist: attachment.artist,
          coverUri: sanitizeDStorageUrl(attachment.cover),
          kind: "Audio",
          uri: sanitizeDStorageUrl(attachment.item)
        } satisfies AttachmentData;
      default:
        return {} as AttachmentData;
    }
  });
};

export default getAttachmentsData;

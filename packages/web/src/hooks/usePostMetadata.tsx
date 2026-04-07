import {
  article,
  audio,
  image,
  textOnly,
  video
} from "@lens-protocol/metadata";
import { useCallback } from "react";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";
import { usePostVideoStore } from "@/store/non-persisted/post/usePostVideoStore";
import type { NewAttachment } from "@/types/misc";
import { usePostAudioStore } from "../store/non-persisted/post/usePostAudioStore";

interface UsePostMetadataProps {
  baseMetadata: any;
  attachment?: NewAttachment;
  isCollectible: boolean;
}

const usePostMetadata = () => {
  const { videoDurationInSeconds, videoThumbnail } = usePostVideoStore();
  const { audioPost } = usePostAudioStore();
  const { license } = usePostLicenseStore();
  const { attachments } = usePostAttachmentStore();
  const { contentWarning } = usePostContentWarningStore();

  const formatAttachments = () =>
    attachments.slice(1).map(({ mimeType, uri }) => ({
      item: uri,
      type: mimeType
    }));

  const getMetadata = useCallback(
    ({ baseMetadata, attachment, isCollectible }: UsePostMetadataProps) => {
      const primaryAttachment = attachment ?? attachments[0];
      const hasAttachments = Boolean(primaryAttachment);
      const isImage = primaryAttachment?.type === "Image";
      const isAudio = primaryAttachment?.type === "Audio";
      const isVideo = primaryAttachment?.type === "Video";

      if (!hasAttachments) {
        return baseMetadata.content?.length > 2000
          ? article({
              ...baseMetadata,
              ...(contentWarning && { contentWarning })
            })
          : textOnly({
              ...baseMetadata,
              ...(contentWarning && { contentWarning })
            });
      }

      const attachmentsToBeUploaded = formatAttachments();

      if (isImage) {
        return image({
          ...baseMetadata,
          ...(attachmentsToBeUploaded.length > 0 && {
            attachments: attachmentsToBeUploaded
          }),
          ...(contentWarning && { contentWarning }),
          image: {
            ...(license && { license }),
            item: primaryAttachment.uri,
            type: primaryAttachment.mimeType
          },
          ...(isCollectible && {
            nft: {
              description: baseMetadata.content,
              image: primaryAttachment.uri,
              name: baseMetadata.title
            }
          })
        });
      }

      if (isAudio) {
        return audio({
          ...baseMetadata,
          ...(attachmentsToBeUploaded.length > 0 && {
            attachments: attachmentsToBeUploaded
          }),
          ...(contentWarning && { contentWarning }),
          audio: {
            ...(audioPost.artist && {
              artist: audioPost.artist
            }),
            cover: audioPost.cover,
            item: primaryAttachment.uri,
            type: primaryAttachment.mimeType,
            ...(license && { license })
          },
          ...(isCollectible && {
            nft: {
              animation_url: primaryAttachment.uri,
              description: baseMetadata.content,
              image: audioPost.cover,
              name: baseMetadata.title
            }
          })
        });
      }

      if (isVideo) {
        return video({
          ...baseMetadata,
          ...(attachmentsToBeUploaded.length > 0 && {
            attachments: attachmentsToBeUploaded
          }),
          ...(contentWarning && { contentWarning }),
          video: {
            cover: videoThumbnail.url,
            duration: Number.parseInt(videoDurationInSeconds, 10),
            item: primaryAttachment.uri,
            type: primaryAttachment.mimeType,
            ...(license && { license })
          },
          ...(isCollectible && {
            nft: {
              animation_url: primaryAttachment.uri,
              description: baseMetadata.content,
              image: audioPost.cover,
              name: baseMetadata.title
            }
          })
        });
      }

      return null;
    },
    [
      attachments,
      videoDurationInSeconds,
      audioPost,
      videoThumbnail,
      license,
      contentWarning
    ]
  );

  return getMetadata;
};

export default usePostMetadata;

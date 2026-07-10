import {
  article,
  audio,
  image,
  link,
  textOnly,
  video
} from "@lens-protocol/metadata";
import { useCallback } from "react";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { usePostAudioStore } from "@/store/non-persisted/post/usePostAudioStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { usePostVideoStore } from "@/store/non-persisted/post/usePostVideoStore";
import type { NewAttachment } from "@/types/misc";

interface UsePostMetadataProps {
  baseMetadata: any;
  attachment?: NewAttachment;
  isCollectible: boolean;
  tags?: string[];
  sharingLink?: string;
}

const usePostMetadata = () => {
  const { videoDurationInSeconds, videoThumbnail } = usePostVideoStore();
  const { audioPost } = usePostAudioStore();
  const { attachments } = usePostAttachmentStore();
  const { contentWarning } = usePostStore();
  const { collectAction } = useCollectActionStore((state) => state);

  const formatAttachments = () =>
    attachments.slice(1).map(({ mimeType, uri }) => ({
      item: uri,
      type: mimeType
    }));

  const getMetadata = useCallback(
    ({
      baseMetadata,
      attachment,
      isCollectible,
      tags,
      sharingLink
    }: UsePostMetadataProps) => {
      if (sharingLink) {
        return link({
          ...baseMetadata,
          ...(contentWarning && { contentWarning }),
          sharingLink,
          tags
        });
      }

      const primaryAttachment = attachment ?? attachments[0];
      const hasAttachments = Boolean(primaryAttachment);
      const isImage = primaryAttachment?.type === "Image";
      const isAudio = primaryAttachment?.type === "Audio";
      const isVideo = primaryAttachment?.type === "Video";

      if (!hasAttachments) {
        return baseMetadata.content?.length > 2000
          ? article({
              ...baseMetadata,
              ...(contentWarning && { contentWarning }),
              tags
            })
          : textOnly({
              ...baseMetadata,
              ...(contentWarning && { contentWarning }),
              tags
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
            ...(collectAction.license && { license: collectAction.license }),
            item: primaryAttachment.uri,
            type: primaryAttachment.mimeType
          },
          ...(isCollectible && {
            nft: {
              description: baseMetadata.content,
              image: primaryAttachment.uri,
              name: baseMetadata.title
            }
          }),
          tags
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
            ...(audioPost.title && {
              title: audioPost.title
            }),
            ...(audioPost.duration > 0 && {
              duration: audioPost.duration
            }),
            cover: audioPost.cover,
            item: primaryAttachment.uri,
            type: primaryAttachment.mimeType,
            ...(collectAction.license && { license: collectAction.license })
          },
          ...(isCollectible && {
            nft: {
              animation_url: primaryAttachment.uri,
              description: baseMetadata.content,
              image: audioPost.cover,
              name: baseMetadata.title
            }
          }),
          tags
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
            ...(collectAction.license && { license: collectAction.license })
          },
          ...(isCollectible && {
            nft: {
              animation_url: primaryAttachment.uri,
              description: baseMetadata.content,
              image: audioPost.cover,
              name: baseMetadata.title
            }
          }),
          tags
        });
      }

      return null;
    },
    [
      attachments,
      videoDurationInSeconds,
      contentWarning,
      audioPost.artist,
      audioPost.title,
      audioPost.duration,
      audioPost.cover,
      videoThumbnail.url,
      collectAction.license
    ]
  );

  return getMetadata;
};

export default usePostMetadata;

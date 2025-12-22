import type { VideoSrc } from "@livepeer/react";
import { getSrc } from "@livepeer/react/external";
import { TRANSFORMS } from "@palus/data/constants";
import imageKit from "@palus/helpers/imageKit";
import type { AttachmentData } from "@palus/types/misc";
import { memo, useState } from "react";
import Audio from "@/components/Shared/Audio";
import { Image, LightBox } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import Video from "./Video";

const getClass = (attachments: number) => {
  const aspect = "aspect-w-16 aspect-h-12";
  if (attachments === 1) return { aspect: "", row: "grid-cols-1 grid-rows-1" };
  if (attachments === 2) return { aspect, row: "grid-cols-2 grid-rows-1" };
  if (attachments <= 4) return { aspect, row: "grid-cols-2 grid-rows-2" };
  if (attachments <= 6) return { aspect, row: "grid-cols-3 grid-rows-2" };
  if (attachments <= 8) return { aspect, row: "grid-cols-4 grid-rows-2" };
  return { aspect, row: "grid-cols-5 grid-rows-2" };
};

interface AttachmentsProps {
  asset?: AttachmentData;
  attachments: AttachmentData[];
}

const Attachments = ({ asset, attachments }: AttachmentsProps) => {
  const [expandedImageIndex, setExpandedImageIndex] = useState<number>(0);
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const processedAttachments = attachments.slice(0, 10);

  const assetType = asset?.type;
  const hasImageAttachment =
    processedAttachments.some((attachment) => attachment.type === "Image") ||
    assetType === "Image";

  const determineDisplay = () => {
    if (assetType === "Video") return "displayVideoAsset";
    if (assetType === "Audio") return "displayAudioAsset";
    if (hasImageAttachment) {
      const imageAttachments = processedAttachments.filter(
        (attachment) =>
          attachment.type === "Image" && attachment.uri !== asset?.uri
      );
      if (asset?.uri) imageAttachments.unshift(asset);
      return [...new Set(imageAttachments)];
    }
    return null;
  };

  const displayDecision = determineDisplay();

  const ImageComponent = ({ uri, index }: { uri: string; index: number }) => (
    <Image
      alt={imageKit(uri, TRANSFORMS.ATTACHMENT)}
      className="max-h-[300px] cursor-pointer rounded-lg border border-gray-200 bg-gray-100 object-cover md:max-h-[500px] dark:border-gray-800 dark:bg-gray-800"
      height={1000}
      loading="lazy"
      onClick={() => {
        setExpandedImageIndex(index);
        setShowLightBox(true);
      }}
      onError={({ currentTarget }) => (currentTarget.src = uri)}
      src={imageKit(uri, TRANSFORMS.ATTACHMENT)}
      width={1000}
    />
  );

  return (
    <div className="mt-3">
      {Array.isArray(displayDecision) && (
        <div
          className={cn("grid gap-2", getClass(displayDecision.length)?.row)}
        >
          {displayDecision.map((attachment, index) => (
            <div
              className={cn(
                getClass(displayDecision.length)?.aspect,
                { "row-span-2": displayDecision.length === 3 && index === 0 },
                { "w-full md:w-2/3": displayDecision.length === 1 }
              )}
              key={attachment.uri}
              onClick={stopEventPropagation}
            >
              <ImageComponent index={index} uri={attachment.uri} />
            </div>
          ))}
          <LightBox
            images={displayDecision?.map((attachment) => attachment.uri)}
            initialIndex={expandedImageIndex}
            onClose={() => {
              setShowLightBox(false);
              setExpandedImageIndex(0);
            }}
            show={showLightBox}
          />
        </div>
      )}
      {displayDecision === "displayVideoAsset" && (
        <Video
          poster={asset?.coverUri as string}
          src={
            getSrc(asset?.uri) || [
              { src: asset?.uri as string, type: "video" } as VideoSrc
            ]
          }
        />
      )}
      {displayDecision === "displayAudioAsset" && (
        <Audio
          artist={asset?.artist}
          poster={asset?.coverUri as string}
          src={asset?.uri as string}
          title={asset?.title}
        />
      )}
    </div>
  );
};

export default memo(Attachments);

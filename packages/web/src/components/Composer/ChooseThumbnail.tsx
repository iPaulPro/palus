import { CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { ChangeEvent } from "react";
import { memo, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import ThumbnailsShimmer from "@/components/Shared/Shimmer/ThumbnailsShimmer";
import { Spinner } from "@/components/Shared/UI";
import generateVideoThumbnails from "@/helpers/generateVideoThumbnails";
import getFileFromDataURL from "@/helpers/getFileFromDataURL";
import { uploadFile } from "@/helpers/uploadFiles";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const DEFAULT_THUMBNAIL_INDEX = 0;
export const THUMBNAIL_GENERATE_COUNT = 4;

interface Thumbnail {
  blobUrl: string;
  decentralizedUrl: string;
}

const ChooseThumbnail = () => {
  const inputId = useId();
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(-1);
  const [hidden, setHidden] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const attachments = useComposerStore((state) => state.attachments);
  const setVideoThumbnail = useComposerStore(
    (state) => state.setVideoThumbnail
  );
  const updateVideoThumbnail = useComposerStore(
    (state) => state.updateVideoThumbnail
  );
  const videoThumbnail = useComposerStore((state) => state.videoThumbnail);
  const { file } = attachments[0];

  const { currentAccount } = useAccountStore();

  const uploadThumbnailToStorageNode = async (fileToUpload: File) => {
    updateVideoThumbnail({ uploading: true });
    const result = await uploadFile(fileToUpload, currentAccount?.address);
    if (!result.uri) {
      return;
    }
    setVideoThumbnail({
      mimeType: fileToUpload.type || "image/jpeg",
      uploading: false,
      url: result.uri
    });

    return result;
  };

  const handleSelectThumbnail = (index: number) => {
    setSelectedThumbnailIndex(index);
    if (thumbnails[index]?.decentralizedUrl === "") {
      updateVideoThumbnail({ uploading: true });
      getFileFromDataURL(
        thumbnails[index].blobUrl,
        "thumbnail.jpeg",
        async (file: File) => {
          updateVideoThumbnail({ uploading: true });
          const result = await uploadFile(file, currentAccount?.address);
          if (!result.uri) {
            toast.error("Failed to upload thumbnail");
            setSelectedThumbnailIndex(-1);
            return;
          }
          const url = result.uri;
          const mimeType = file.type || "image/jpeg";
          setThumbnails((prev) =>
            prev.map((thumbnail, i) =>
              i === index ? { ...thumbnail, decentralizedUrl: url } : thumbnail
            )
          );
          setVideoThumbnail({ mimeType, uploading: false, url });
        }
      );
    } else {
      updateVideoThumbnail({
        uploading: false,
        url: thumbnails[index]?.decentralizedUrl
      });
    }
  };

  const generateThumbnails = async (fileToGenerate: File) => {
    setIsGenerating(true);
    try {
      const thumbnailArray = await generateVideoThumbnails(
        fileToGenerate,
        THUMBNAIL_GENERATE_COUNT
      );
      const thumbnailList: Thumbnail[] = [];
      for (const thumbnailBlob of thumbnailArray) {
        thumbnailList.push({ blobUrl: thumbnailBlob, decentralizedUrl: "" });
      }
      setThumbnails(thumbnailList);
      setSelectedThumbnailIndex(DEFAULT_THUMBNAIL_INDEX);
    } catch {
      setHidden(true);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleSelectThumbnail(selectedThumbnailIndex);
  }, [selectedThumbnailIndex]);

  useEffect(() => {
    if (file) {
      generateThumbnails(file);
    } else {
      setHidden(true);
    }
    return () => {
      setSelectedThumbnailIndex(-1);
      setThumbnails([]);
    };
  }, [file]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      try {
        setImageUploading(true);
        setSelectedThumbnailIndex(-1);
        const file = event.target.files[0];
        const result = await uploadThumbnailToStorageNode(file);
        if (!result?.uri) {
          toast.error("Failed to upload thumbnail");
          return;
        }
        const preview = window.URL?.createObjectURL(file);
        setThumbnails((prev) => [
          { blobUrl: preview, decentralizedUrl: result.uri },
          ...prev
        ]);
        setSelectedThumbnailIndex(0);
      } catch {
        toast.error("Failed to upload thumbnail");
      } finally {
        setImageUploading(false);
      }
    }
  };

  const isUploading = videoThumbnail.uploading;

  return (
    <div className="mt-5">
      <b>Choose Thumbnail</b>
      <div className="mt-1 grid grid-cols-3 gap-3 py-0.5 md:grid-cols-5">
        <label
          className="flex h-24 w-full max-w-32 flex-none cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800"
          htmlFor={inputId}
        >
          <input
            accept=".png, .jpg, .jpeg"
            className="sr-only"
            id={inputId}
            onChange={handleUpload}
            type="file"
          />
          {imageUploading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <PhotoIcon className="mb-1 size-5" />
              <span className="text-sm">Upload</span>
            </>
          )}
        </label>
        {thumbnails.length || hidden || isGenerating ? null : (
          <ThumbnailsShimmer />
        )}
        {thumbnails.map(({ blobUrl, decentralizedUrl }, index) => {
          const isSelected = selectedThumbnailIndex === index;
          const isUploaded = decentralizedUrl === videoThumbnail.url;
          const key = `${blobUrl}_${index}`;

          return (
            <button
              className="relative"
              disabled={isUploading}
              key={key}
              onClick={() => handleSelectThumbnail(index)}
              type="button"
            >
              <img
                alt="thumbnail"
                className="h-24 w-full rounded-xl border border-gray-200 object-cover dark:border-gray-800"
                draggable={false}
                src={blobUrl}
              />
              {decentralizedUrl && isSelected && isUploaded ? (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-gray-100/10">
                  <CheckCircleIcon className="size-6 rounded-full bg-white/70" />
                </div>
              ) : null}
              {isUploading && isSelected && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-gray-100/10 backdrop-blur-md">
                  <div className="rounded-full bg-white/70">
                    <Spinner size="sm" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(ChooseThumbnail);

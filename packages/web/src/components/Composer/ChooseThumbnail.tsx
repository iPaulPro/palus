import { CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { ChangeEvent } from "react";
import { memo, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import ThumbnailsShimmer from "@/components/Shared/Shimmer/ThumbnailsShimmer";
import { Spinner } from "@/components/Shared/UI";
import generateVideoThumbnails from "@/helpers/generateVideoThumbnails";
import getFileFromDataURL from "@/helpers/getFileFromDataURL";
import { uploadFile } from "@/helpers/uploadFiles";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { usePostVideoStore } from "@/store/non-persisted/post/usePostVideoStore";
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

  const { attachments } = usePostAttachmentStore();
  const { setVideoThumbnail, videoThumbnail } = usePostVideoStore();
  const { file } = attachments[0];

  const { currentAccount } = useAccountStore();

  const uploadThumbnailToStorageNode = async (fileToUpload: File) => {
    setVideoThumbnail({ ...videoThumbnail, uploading: true });
    const result = await uploadFile(fileToUpload, currentAccount?.address);
    if (!result.uri) {
      toast.error("Failed to upload thumbnail");
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
      setVideoThumbnail({ ...videoThumbnail, uploading: true });
      getFileFromDataURL(
        thumbnails[index].blobUrl,
        "thumbnail.jpeg",
        async (file: File) => {
          setVideoThumbnail({ ...videoThumbnail, uploading: true });
          const result = await uploadFile(file, currentAccount?.address);
          if (!result.uri) {
            toast.error("Failed to upload thumbnail");
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
      setVideoThumbnail({
        ...videoThumbnail,
        uploading: false,
        url: thumbnails[index]?.decentralizedUrl
      });
    }
  };

  const generateThumbnails = async (fileToGenerate: File) => {
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
        const preview = window.URL?.createObjectURL(file);
        setThumbnails([
          { blobUrl: preview, decentralizedUrl: result.uri },
          ...thumbnails
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
        {thumbnails.length || hidden ? null : <ThumbnailsShimmer />}
        {thumbnails.map(({ blobUrl, decentralizedUrl }, index) => {
          const isSelected = selectedThumbnailIndex === index;
          const isUploaded = decentralizedUrl === videoThumbnail.url;

          return (
            <button
              className="relative"
              disabled={isUploading}
              key={`${blobUrl}_${index}`}
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
                  <CheckCircleIcon className="size-6" />
                </div>
              ) : null}
              {isUploading && isSelected && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-gray-100/10 backdrop-blur-md">
                  <Spinner size="sm" />
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

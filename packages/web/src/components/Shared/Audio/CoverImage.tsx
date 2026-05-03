import { PhotoIcon } from "@heroicons/react/24/outline";
import { MediaImageMimeType } from "@lens-protocol/metadata";
import type { ChangeEvent, Ref } from "react";
import { useCallback, useState } from "react";
import { Image, LightBox, Spinner } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import imageKit from "@/helpers/imageKit";
import sanitizeDStorageUrl from "@/helpers/sanitizeDStorageUrl";
import { uploadFile } from "@/helpers/uploadFiles";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

interface CoverImageProps {
  cover: string;
  imageRef: Ref<HTMLImageElement>;
  isNew: boolean;
  isEditing: boolean;
  setCover: (previewUri: string, url: string, mimeType: string) => void;
}

const ImageMimeType = Object.values(MediaImageMimeType);

const CoverImage = ({
  cover,
  imageRef,
  isNew,
  isEditing,
  setCover
}: CoverImageProps) => {
  const { currentAccount } = useAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLightBox, setShowLightBox] = useState(false);

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      try {
        setIsSubmitting(true);
        const file = event.target.files[0];
        const attachment = await uploadFile(file, currentAccount?.address);
        setCover(
          URL.createObjectURL(file),
          attachment.uri,
          file.type || "image/jpeg"
        );
      } catch (error) {
        onError(error as ApolloClientError);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const coverSrc = imageKit(sanitizeDStorageUrl(cover), TRANSFORMS.ATTACHMENT);

  return (
    <div className="group relative h-full flex-none overflow-hidden">
      <button
        className="flex h-full justify-center focus:outline-hidden"
        type="button"
      >
        <Image
          alt={`attachment-audio-cover-${cover}`}
          className="aspect-square h-full object-cover"
          draggable={false}
          onClick={() => setShowLightBox(true)}
          onError={({ currentTarget }) => {
            currentTarget.src = cover ? sanitizeDStorageUrl(cover) : cover;
          }}
          ref={imageRef}
          src={cover ? coverSrc : cover}
        />
        <LightBox
          images={[coverSrc]}
          onClose={() => setShowLightBox(false)}
          show={showLightBox}
        />
      </button>
      {(isNew || isEditing) && (
        <label
          className={cn(
            { invisible: cover, visible: isSubmitting },
            "absolute top-0 grid aspect-square h-full cursor-pointer place-items-center bg-gray-100 backdrop-blur-lg group-hover:visible dark:bg-gray-900"
          )}
        >
          {isSubmitting ? (
            <Spinner size="sm" />
          ) : (
            <div className="flex flex-col items-center text-sm opacity-60">
              <PhotoIcon className="size-5" />
              <span>{cover ? "Change cover" : "Add cover"}</span>
            </div>
          )}
          <input
            accept={ImageMimeType.join()}
            className="hidden w-full"
            onChange={onChange}
            type="file"
          />
        </label>
      )}
    </div>
  );
};

export default CoverImage;

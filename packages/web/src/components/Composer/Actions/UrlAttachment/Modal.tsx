import {
  MediaAudioMimeType,
  MediaImageMimeType
} from "@lens-protocol/metadata";
import { useCallback, useState } from "react";
import { z } from "zod";
import Audio from "@/components/Shared/Audio";
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  useZodForm
} from "@/components/Shared/UI";
import generateUUID from "@/helpers/generateUUID";
import sanitizeDStorageUrl from "@/helpers/sanitizeDStorageUrl";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import type { NewAttachment } from "@/types/misc";

const ImageMimeTypes = Object.values(MediaImageMimeType) as string[];
const AudioMimeTypes = Object.values(MediaAudioMimeType) as string[];
const VideoMimeTypes = [
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/quicktime"
];

const AllowedMimeTypes = [
  ...ImageMimeTypes,
  ...AudioMimeTypes,
  ...VideoMimeTypes
];

const getMediaType = (mimeType: string): "Audio" | "Image" | "Video" | null => {
  if (ImageMimeTypes.includes(mimeType)) return "Image";
  if (AudioMimeTypes.includes(mimeType)) return "Audio";
  if (VideoMimeTypes.includes(mimeType)) return "Video";
  return null;
};

const ValidationSchema = z.object({
  url: z.url({ message: "Please enter a valid URL" })
});

interface Preview {
  mimeType: string;
  type: "Audio" | "Image" | "Video";
  url: string;
  sanitizedUrl: string;
}

const UrlAttachmentModal = ({
  setShowModal,
  showModal
}: {
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}) => {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAttachments } = usePostAttachmentStore();

  const form = useZodForm({
    schema: ValidationSchema
  });

  const resetState = useCallback(() => {
    setPreview(null);
    setError(null);
    setLoading(false);
    form.reset();
  }, [form]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    resetState();
  }, [setShowModal, resetState]);

  const fetchMimeType = useCallback(async (url: string) => {
    setLoading(true);
    setPreview(null);
    setError(null);

    const sanitizedUrl = sanitizeDStorageUrl(url);
    try {
      const response = await fetch(sanitizedUrl, {
        method: "HEAD"
      });
      const contentType = response.headers.get("content-type")?.split(";")[0];

      if (!contentType || !AllowedMimeTypes.includes(contentType)) {
        setError(
          contentType
            ? `Unsupported media type: ${contentType}`
            : "Could not determine media type. The URL must point to an image, audio, or video file."
        );
        setLoading(false);
        return;
      }

      const mediaType = getMediaType(contentType);
      if (!mediaType) {
        setError("The URL does not point to a supported media resource.");
        setLoading(false);
        return;
      }

      setPreview({ mimeType: contentType, sanitizedUrl, type: mediaType, url });
    } catch {
      setError(
        "Failed to fetch the URL. Make sure it's accessible and points to a media file."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (data: z.infer<typeof ValidationSchema>) => {
      await fetchMimeType(data.url);
    },
    [fetchMimeType]
  );

  const handleAttach = useCallback(() => {
    if (!preview) return;

    const attachment: NewAttachment = {
      id: generateUUID(),
      mimeType: preview.mimeType,
      previewUri: preview.sanitizedUrl,
      type: preview.type,
      uri: preview.url
    };

    addAttachments([attachment]);
    handleClose();
  }, [preview, addAttachments, handleClose]);

  return (
    <Modal onClose={handleClose} show={showModal} title="Attach from URL">
      <Form className="gap-y-4 p-5" form={form} onSubmit={handleSubmit}>
        <Input
          error={!!form.formState.errors.url}
          placeholder="Enter URL"
          type="url"
          {...form.register("url")}
          autoComplete="off"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {preview && (
          <div>
            {preview.type === "Video" ? (
              <video
                className="w-full"
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                disableRemotePlayback
                src={preview.sanitizedUrl}
              />
            ) : preview.type === "Audio" ? (
              <Audio isNew poster="" src={preview.sanitizedUrl} />
            ) : preview.type === "Image" ? (
              <Image
                alt="URL preview"
                className="w-full object-cover"
                height={1000}
                loading="lazy"
                src={preview.sanitizedUrl}
                width={1000}
              />
            ) : null}
          </div>
        )}

        <div className="flex items-center justify-end gap-x-2">
          {!preview && (
            <Button disabled={loading} type="submit">
              {loading ? "Checking…" : "Check URL"}
            </Button>
          )}
          {preview && (
            <Button className="w-fit" onClick={handleAttach} type="button">
              Attach
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default UrlAttachmentModal;

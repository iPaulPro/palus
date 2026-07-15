import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { AnchorProps } from "@headlessui/react/dist/internal/floating";
import {
  ChartBarIcon,
  GifIcon,
  PaperClipIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import { ChartBarIcon as ChartBarIconSolid } from "@heroicons/react/24/solid";
import {
  MediaAudioMimeType,
  MediaImageMimeType
} from "@lens-protocol/metadata";
import { useClickAway } from "@uidotdev/usehooks";
import type { ChangeEvent, RefObject } from "react";
import { memo, useState } from "react";
import { toast } from "sonner";
import GifSelector from "@/components/Composer/Actions/Gif/GifSelector";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import MenuTransition from "@/components/Shared/MenuTransition";
import { Modal, Spinner, Tooltip } from "@/components/Shared/UI";
import { MAX_IMAGE_UPLOAD } from "@/data/constants";
import cn from "@/helpers/cn";
import useUploadAttachments from "@/hooks/useUploadAttachments";
import type { IGif } from "@/types/giphy";

const ImageMimeType = Object.values(MediaImageMimeType);
const AudioMimeType = Object.values(MediaAudioMimeType);
const VideoMimeType = [
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/quicktime"
];

interface UploadOptionProps {
  accept: string[];
  disabled: boolean;
  onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
}

const UploadOption = ({
  accept,
  disabled,
  onChange,
  onClick
}: UploadOptionProps) => {
  return (
    <MenuItem
      as="label"
      className={({ focus }) =>
        cn(
          "menu-item flex! cursor-pointer items-center gap-1 space-x-1 rounded-lg",
          { "dropdown-active": focus, "opacity-50": disabled }
        )
      }
      disabled={disabled}
      htmlFor="upload-media"
      onClick={onClick}
    >
      <PaperClipIcon className="size-4" />
      <span className="text-sm">Upload media</span>
      <input
        accept={accept.join(",")}
        className="hidden"
        disabled={disabled}
        id="upload-media"
        multiple={true}
        onChange={onChange}
        type="file"
      />
    </MenuItem>
  );
};

interface AttachmentProps {
  anchor?: AnchorProps;
  disabled: boolean;
  setGifAttachment: (gif: IGif) => void;
}

const Attachment = ({
  anchor = "bottom",
  disabled,
  setGifAttachment
}: AttachmentProps) => {
  const attachments = useComposerStore((state) => state.attachments);
  const isUploading = useComposerStore((state) => state.isUploading);
  const resetPollConfig = useComposerStore((state) => state.resetPollConfig);
  const setShowPollEditor = useComposerStore(
    (state) => state.setShowPollEditor
  );
  const showPollEditor = useComposerStore((state) => state.showPollEditor);
  const editingPost = useComposerStore((state) => state.editingPost);

  const { handleUploadAttachments } = useUploadAttachments();
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useClickAway(() =>
    setShowMenu(false)
  ) as RefObject<HTMLDivElement>;

  const allowedTypes = [...ImageMimeType, ...AudioMimeType, ...VideoMimeType];

  const isTypeAllowed = (files: FileList) =>
    Array.from(files).every((file) => allowedTypes.includes(file.type));

  const isUploadAllowed = (files: FileList) => {
    const isImage = files[0]?.type.startsWith("image");
    const areAllImages = Array.from(files).every((file) =>
      file.type.startsWith("image")
    );
    return isImage
      ? attachments.length + files.length <= MAX_IMAGE_UPLOAD && areAllImages
      : files.length === 1;
  };

  const handleAttachment = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setShowMenu(false);
    const { files } = evt.target;
    if (!files?.length) return;

    if (!isUploadAllowed(files)) {
      return toast.error(
        `Exceeded max limit of 1 audio, 1 video, or ${MAX_IMAGE_UPLOAD} images`
      );
    }
    if (!isTypeAllowed(files)) {
      return toast.error("File format not supported");
    }
    try {
      await handleUploadAttachments(files);
      evt.target.value = "";
    } catch {
      toast.error("Something went wrong while uploading!");
    }
  };

  const isImageAttachments = attachments[0]?.type === "Image";
  const disableImageUpload = attachments.length >= MAX_IMAGE_UPLOAD;
  const disableOtherUpload = attachments.length > 0;

  return (
    <>
      <Menu as="div">
        <Tooltip
          className="flex items-center"
          content="Attachments"
          placement="top"
          withDelay
        >
          <MenuButton
            aria-label="More"
            className="rounded-full outline-offset-8 disabled:opacity-50"
            disabled={disabled}
            onClick={() => setShowMenu(!showMenu)}
          >
            {isUploading ? (
              <Spinner size="sm" />
            ) : (
              <PlusCircleIcon className="size-5.5" />
            )}
          </MenuButton>
        </Tooltip>
        <MenuTransition show={showMenu}>
          <MenuItems
            anchor={anchor}
            className="absolute z-5 mt-2 rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
            ref={dropdownRef}
            static
          >
            <UploadOption
              accept={isImageAttachments ? ImageMimeType : allowedTypes}
              disabled={
                isImageAttachments ? disableImageUpload : disableOtherUpload
              }
              onChange={handleAttachment}
            />
            <MenuItem
              as="div"
              className={({ focus }) =>
                cn(
                  { "dropdown-active": focus, "opacity-50": disabled },
                  "m-2 flex cursor-pointer items-center gap-x-2 rounded-lg px-2 py-1.5 text-sm"
                )
              }
              disabled={disabled || disableImageUpload}
              onClick={() => {
                setShowMenu(false);
                setShowModal(true);
              }}
            >
              <GifIcon className="size-4" />
              <span className="text-sm">Add a GIF</span>
            </MenuItem>
            {!editingPost && (
              <>
                <div className="divider" />
                <MenuItem
                  as="div"
                  className={({ focus }) =>
                    cn(
                      { "dropdown-active": focus, "opacity-50": disabled },
                      "m-2 flex cursor-pointer items-center gap-x-2 rounded-lg px-2 py-1.5 text-sm"
                    )
                  }
                  onClick={() => {
                    setShowMenu(false);
                    resetPollConfig();
                    setShowPollEditor(!showPollEditor);
                  }}
                >
                  {showPollEditor ? (
                    <>
                      <ChartBarIconSolid className="size-4 text-brand-400" />
                      <span className="text-sm">Remove poll</span>
                    </>
                  ) : (
                    <>
                      <ChartBarIcon className="size-4" />
                      <span className="text-sm">Add a poll</span>
                    </>
                  )}
                </MenuItem>
              </>
            )}
          </MenuItems>
        </MenuTransition>
      </Menu>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Select GIF"
      >
        <GifSelector
          setGifAttachment={setGifAttachment}
          setShowModal={setShowModal}
        />
      </Modal>
    </>
  );
};

export default memo(Attachment);

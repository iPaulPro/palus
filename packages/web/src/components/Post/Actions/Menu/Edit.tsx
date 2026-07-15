import { MenuItem } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import type { AudioPost } from "@/components/Composer/ComposerStore";
import cn from "@/helpers/cn";
import generateUUID from "@/helpers/generateUUID";
import { getMimeType } from "@/helpers/getMimeType";
import getPostData from "@/helpers/getPostData";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import type { NewAttachment } from "@/types/misc";

interface EditProps {
  post: PostFragment;
}

const getDefaultType = (kind: "Audio" | "Image" | "Video") => {
  switch (kind) {
    case "Audio":
      return "audio/mpeg";
    case "Video":
      return "video/mp4";
    case "Image":
      return "image/jpeg";
  }
};

const Edit = ({ post }: EditProps) => {
  const { open: openNewPostModal } = useNewPostModalStore();

  const handleEdit = () => {
    const data = getPostData(post.metadata);

    const attachments: NewAttachment[] = [];
    let audioPost: AudioPost | undefined;
    if (data?.asset) {
      const primaryAttachment = {
        id: generateUUID(),
        mimeType: data.asset.type
          ? getMimeType(data.asset.type)
          : getDefaultType(data.asset.kind),
        previewUri: data.asset.uri,
        type: data.asset.kind,
        uri: data.asset.uri
      };
      attachments.push(primaryAttachment);

      if (post.metadata.__typename === "AudioMetadata") {
        audioPost = {
          artist: data.asset.artist ?? "",
          cover: data.asset.coverUri ?? "",
          duration: data.asset.duration ?? 0,
          mimeType: primaryAttachment.mimeType,
          title: data.asset.title ?? ""
        };
      }
    }

    if (data?.attachments) {
      for (const a of data.attachments) {
        attachments.push({
          id: generateUUID(),
          mimeType: a.type ? getMimeType(a.type) : getDefaultType(a.kind),
          previewUri: a.uri,
          type: a.kind,
          uri: a.uri
        });
      }
    }
    openNewPostModal({
      ...(audioPost && { audioPost }),
      attachments,
      editingPost: post,
      postContent: data?.content || ""
    });
  };

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={(event) => {
        stopEventPropagation(event);
        handleEdit();
      }}
    >
      <div className="flex items-center gap-x-2">
        <PencilSquareIcon className="size-4" />
        <div>Edit</div>
      </div>
    </MenuItem>
  );
};

export default Edit;

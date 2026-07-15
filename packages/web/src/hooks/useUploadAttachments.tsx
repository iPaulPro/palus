import { useCallback } from "react";
import { toast } from "sonner";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import {
  createPreviewAttachments,
  validateFileSize
} from "@/helpers/attachmentUtils";
import uploadFiles from "@/helpers/uploadFiles";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { NewAttachment } from "@/types/misc";

const useUploadAttachments = () => {
  const { currentAccount } = useAccountStore();
  const addAttachments = useComposerStore((state) => state.addAttachments);
  const removeAttachments = useComposerStore(
    (state) => state.removeAttachments
  );
  const setIsUploading = useComposerStore((state) => state.setIsUploading);
  const updateAttachments = useComposerStore(
    (state) => state.updateAttachments
  );

  const handleUploadAttachments = useCallback(
    async (attachments: FileList): Promise<NewAttachment[]> => {
      setIsUploading(true);

      const files = Array.from(attachments);
      if (!files.every(validateFileSize)) {
        setIsUploading(false);
        return [];
      }

      const previewAttachments = createPreviewAttachments(files);
      const attachmentIds = previewAttachments.map(({ id }) => id as string);

      addAttachments(previewAttachments);

      try {
        const uploaded = await uploadFiles(files, currentAccount?.address);
        const result = uploaded.map((file, index) => ({
          ...previewAttachments[index],
          mimeType: file.mimeType,
          uri: file.uri
        }));

        updateAttachments(result);
        setIsUploading(false);

        return result;
      } catch {
        toast.error("Something went wrong while uploading!");
        removeAttachments(attachmentIds);
        setIsUploading(false);
        return [];
      }
    },
    [
      addAttachments,
      removeAttachments,
      setIsUploading,
      updateAttachments,
      currentAccount?.address
    ]
  );

  return { handleUploadAttachments };
};

export default useUploadAttachments;

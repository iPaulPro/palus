import {
  type EvmAddress,
  immutable,
  lensAccountOnly
} from "@lens-chain/storage-client";
import { CHAIN } from "@/data/constants";
import { storageClient } from "./storageClient";

interface UploadResult {
  mimeType: string;
  uri: string;
}

const FALLBACK_TYPE = "image/jpeg";

const uploadFiles = async (
  data: FileList | File[],
  account?: string
): Promise<UploadResult[]> => {
  try {
    const files = Array.from(data) as File[];

    const acl = account
      ? lensAccountOnly(account as EvmAddress, CHAIN.id)
      : immutable(CHAIN.id);

    const attachments = await Promise.all(
      files.map(async (file: File) => {
        const storageNodeResponse = await storageClient.uploadFile(file, {
          acl
        });

        return {
          mimeType: file.type || FALLBACK_TYPE,
          uri: storageNodeResponse.uri
        };
      })
    );

    return attachments;
  } catch {
    return [];
  }
};

export const uploadFile = async (
  file: File,
  account?: string
): Promise<UploadResult> => {
  try {
    const uploadResults = await uploadFiles([file], account);
    const metadata = uploadResults[0];

    return { mimeType: file.type || FALLBACK_TYPE, uri: metadata.uri };
  } catch {
    return { mimeType: file.type || FALLBACK_TYPE, uri: "" };
  }
};

export const uploadImage = async (
  base64: string,
  type = "image/png",
  account?: string
): Promise<UploadResult> => {
  try {
    const dataUrlMatch = base64.match(/^data:(.+);base64,(.*)$/);
    const mime = dataUrlMatch ? dataUrlMatch[1] : type;
    const b64 = dataUrlMatch
      ? dataUrlMatch[2]
      : base64.replace(/^data:.+;base64,/, "");

    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const file = new File([bytes], "notification-share.png", { type: mime });

    const uploadResults = await uploadFiles([file], account);
    const metadata = uploadResults[0];
    return { mimeType: file.type || FALLBACK_TYPE, uri: metadata.uri };
  } catch {
    return { mimeType: type || FALLBACK_TYPE, uri: "" };
  }
};

export default uploadFiles;

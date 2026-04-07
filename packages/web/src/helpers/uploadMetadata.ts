import {
  type EvmAddress,
  immutable,
  lensAccountOnly
} from "@lens-chain/storage-client";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { CHAIN, THIRD_WEB_CLIENT_ID } from "@/data/constants";
import { storageClient } from "./storageClient";

interface MetadataPayload {
  [key: string]: unknown;
}

const uploadMetadata = async (
  data: MetadataPayload | null,
  account?: string
): Promise<string> => {
  let uri: string | undefined;

  const acl = account
    ? lensAccountOnly(account as EvmAddress, CHAIN.id)
    : immutable(CHAIN.id);

  try {
    const upload = await storageClient.uploadAsJson(data, { acl });
    uri = upload.uri;
  } catch (e) {
    console.error("Failed to upload metadata to grove", e);
  }

  if (!uri) {
    // Fallback to thirdweb if grove upload fails
    const storage = new ThirdwebStorage({
      clientId: THIRD_WEB_CLIENT_ID
    });

    try {
      const file = new File([JSON.stringify(data)], "metadata.json", {
        type: "application/json"
      });
      const upload = await storage.upload(file, {
        uploadWithoutDirectory: true
      });
      uri = upload;
    } catch (e) {
      console.error("Failed to upload metadata to thirdweb", e);
      throw new Error("Failed to upload metadata");
    }
  }

  return uri;
};

export default uploadMetadata;

import { ERRORS } from "@hey/data/errors";
import { immutable } from "@lens-chain/storage-client";
import { mainnet } from "viem/chains";
import { storageClient } from "./storageClient";

interface MetadataPayload {
  [key: string]: unknown;
}

const uploadMetadata = async (
  data: MetadataPayload | null
): Promise<string> => {
  try {
    const { uri } = await storageClient.uploadAsJson(data, {
      acl: immutable(mainnet.id)
    });

    return uri;
  } catch {
    throw new Error(ERRORS.SomethingWentWrong);
  }
};

export default uploadMetadata;

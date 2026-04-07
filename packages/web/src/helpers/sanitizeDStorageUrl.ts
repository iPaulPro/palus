import { IPFS_GATEWAY, STORAGE_NODE_URL } from "@/data/constants";

const sanitizeDStorageUrl = (url?: string): string => {
  if (!url) {
    return "";
  }

  if (/^Qm[1-9A-Za-z]{44}/.test(url)) {
    return `${IPFS_GATEWAY}${url}`;
  }

  return url
    .replace("https://ipfs.io/ipfs/", IPFS_GATEWAY)
    .replace("ipfs://ipfs/", IPFS_GATEWAY)
    .replace("ipfs://", IPFS_GATEWAY)
    .replace("lens://", STORAGE_NODE_URL)
    .replace("ar://", "https://gateway.arweave.net/");
};

export default sanitizeDStorageUrl;

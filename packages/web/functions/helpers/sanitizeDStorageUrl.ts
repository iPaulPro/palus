const IPFS_GATEWAY = "https://gw.ipfs-lens.dev/ipfs/";

export const sanitizeDStorageUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (/^Qm[1-9A-Za-z]{44}/.test(url)) {
    return `${IPFS_GATEWAY}${url}`;
  }

  return url
    .replace("https://ipfs.io/ipfs/", IPFS_GATEWAY)
    .replace("ipfs://ipfs/", IPFS_GATEWAY)
    .replace("ipfs://", IPFS_GATEWAY)
    .replace("lens://", "https://api.grove.storage/")
    .replace("ar://", "https://gateway.arweave.net/");
};

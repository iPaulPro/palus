import { useMediaQuery } from "@uidotdev/usehooks";
import { useCallback } from "react";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface Props {
  url: string;
}

const useShareUrl = ({ url }: Props) => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);

  const copy = useCopyToClipboard(url, "Copied to clipboard!");

  const share = useCallback(async () => {
    const shareData = { url };
    if (isSmallDevice && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return;
    }
    await copy();
  }, [url, isSmallDevice, copy]);

  return { share };
};

export default useShareUrl;

import { MenuItem } from "@headlessui/react";
import { ShareIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import { useMediaQuery } from "@uidotdev/usehooks";
import cn from "@/helpers/cn";
import getAccount from "@/helpers/getAccount";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface CopyLinkProps {
  account: AccountFragment;
}

const Share = ({ account }: CopyLinkProps) => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);

  const copyLink = useCopyToClipboard(
    `${location.origin}${getAccount(account).link}`,
    "Link copied to clipboard!"
  );
  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={async (event) => {
        stopEventPropagation(event);
        const shareData = {
          url: `${location.origin}${getAccount(account).link}`
        };
        if (isSmallDevice && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
        copyLink();
      }}
    >
      <ShareIcon className="size-4" />
      <div>Share</div>
    </MenuItem>
  );
};

export default Share;

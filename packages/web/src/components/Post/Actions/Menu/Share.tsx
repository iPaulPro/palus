import { MenuItem } from "@headlessui/react";
import { ShareIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import { useMediaQuery } from "@uidotdev/usehooks";
import cn from "@/helpers/cn";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface ShareProps {
  post: PostFragment;
}

const Share = ({ post }: ShareProps) => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);

  const copyLink = useCopyToClipboard(
    `${location.origin}/posts/${post.slug}`,
    "Copied to clipboard!"
  );

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={async (event) => {
        stopEventPropagation(event);
        const shareData = {
          url: `${location.origin}/posts/${post.slug}`
        };
        if (isSmallDevice && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
        copyLink();
      }}
    >
      <div className="flex items-center space-x-2">
        <ShareIcon className="size-4" />
        <div>Share</div>
      </div>
    </MenuItem>
  );
};

export default Share;

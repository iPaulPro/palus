import { MenuItem } from "@headlessui/react";
import { ShareIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useShareUrl from "../../../../hooks/useShareUrl";

interface ShareProps {
  post: PostFragment;
}

const Share = ({ post }: ShareProps) => {
  const { share } = useShareUrl({
    url: `${location.origin}/posts/${post.slug}`
  });

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
        await share();
      }}
    >
      <div className="flex items-center gap-x-2">
        <ShareIcon className="size-4" />
        <div>Share</div>
      </div>
    </MenuItem>
  );
};

export default Share;

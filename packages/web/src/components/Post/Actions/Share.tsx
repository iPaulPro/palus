import { ShareIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import { Tooltip } from "@/components/Shared/UI";
import useShareUrl from "@/hooks/useShareUrl";

interface Props {
  post: PostFragment;
}

const Share = ({ post }: Props) => {
  const { share } = useShareUrl({
    url: `${location.origin}/posts/${post.slug}`
  });

  return (
    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-200">
      <button
        aria-label="Share"
        className="rounded-full p-1.5 outline-offset-2 hover:bg-gray-300/20"
        onClick={share}
        type="button"
      >
        <Tooltip content="Share" placement="top" withDelay>
          <ShareIcon className="size-4.5" />
        </Tooltip>
      </button>
    </div>
  );
};

export default Share;

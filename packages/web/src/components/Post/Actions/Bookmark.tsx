import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import type { PostFragment } from "@palus/indexer";
import Loader from "@/components/Shared/Loader";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import nFormatter from "@/helpers/nFormatter";
import useToggleBookmark from "@/hooks/useToggleBookmark";

interface BookmarkProps {
  post: PostFragment;
  showCount: boolean;
}

const Bookmark = ({ post, showCount }: BookmarkProps) => {
  const { count, hasBookmarked, isLoading, toggleBookmark } = useToggleBookmark(
    { post }
  );

  return (
    <div
      className={cn(
        hasBookmarked ? "text-brand-500" : "text-gray-500 dark:text-gray-200",
        "flex items-center space-x-1"
      )}
    >
      <button
        aria-label="Bookmark"
        className={cn(
          hasBookmarked ? "hover:bg-brand-300/20" : "hover:bg-gray-300/20",
          "rounded-full p-1.5 outline-offset-2"
        )}
        disabled={isLoading}
        onClick={toggleBookmark}
        type="button"
      >
        {isLoading ? (
          <Loader size="sm" />
        ) : (
          <Tooltip
            content={hasBookmarked ? "Remove Bookmark" : "Bookmark"}
            placement="top"
            withDelay
          >
            {hasBookmarked ? (
              <BookmarkIconSolid className="w-5" />
            ) : (
              <BookmarkIconOutline className="w-5" />
            )}
          </Tooltip>
        )}
      </button>
      {count > 0 && showCount ? (
        <span
          className={cn(
            hasBookmarked
              ? "text-brand-500"
              : "text-gray-500 dark:text-gray-200",
            "w-3 text-sm"
          )}
        >
          {nFormatter(count)}
        </span>
      ) : null}
    </div>
  );
};

export default Bookmark;

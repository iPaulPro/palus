import { MenuItem } from "@headlessui/react";
import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import type { PostFragment } from "@palus/indexer";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useToggleBookmark from "@/hooks/useToggleBookmark";

interface BookmarkProps {
  post: PostFragment;
}

const Bookmark = ({ post }: BookmarkProps) => {
  const { hasBookmarked, toggleBookmark } = useToggleBookmark({
    post,
    showToast: true
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
        await toggleBookmark();
      }}
    >
      <div className="flex items-center gap-x-2">
        {hasBookmarked ? (
          <>
            <BookmarkIconSolid className="size-4" />
            <div>Remove Bookmark</div>
          </>
        ) : (
          <>
            <BookmarkIconOutline className="size-4" />
            <div>Bookmark</div>
          </>
        )}
      </div>
    </MenuItem>
  );
};

export default Bookmark;

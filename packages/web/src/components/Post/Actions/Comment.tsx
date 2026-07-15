import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import { memo } from "react";
import { useNavigate } from "react-router";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import nFormatter from "@/helpers/nFormatter";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface CommentProps {
  post: PostFragment;
  showCount: boolean;
}

const Comment = ({ post, showCount }: CommentProps) => {
  const count = post.stats.comments;
  const { open: openNewPostModal } = useNewPostModalStore();
  const navigate = useNavigate();
  const { currentAccount } = useAccountStore();
  const hasCommented =
    post.operations?.hasCommented.optimistic ||
    post.operations?.hasCommented.onChain;

  return (
    <div className="flex items-center gap-x-1 text-gray-500 dark:text-gray-200">
      <button
        aria-label="Comment"
        className={cn(
          hasCommented
            ? "text-brand-500 hover:bg-brand-300/20"
            : "text-gray-500 hover:bg-gray-300/20 dark:text-gray-200",
          "rounded-full p-1.5 outline-offset-2"
        )}
        onClick={() => {
          if (currentAccount) {
            openNewPostModal({ parentPost: post });
          } else {
            navigate(`/posts/${post.slug}`);
          }
        }}
        type="button"
      >
        <Tooltip content="Comment" placement="top" withDelay>
          <ChatBubbleLeftIcon className="size-5" />
        </Tooltip>
      </button>
      {count > 0 && showCount ? (
        <span
          className={cn(
            hasCommented
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

export default memo(Comment);

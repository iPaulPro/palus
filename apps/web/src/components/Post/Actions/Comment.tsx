import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import { memo } from "react";
import { useNavigate } from "react-router";
import { Tooltip } from "@/components/Shared/UI";
import humanize from "@/helpers/humanize";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";

interface CommentProps {
  post: PostFragment;
  showCount: boolean;
}

const Comment = ({ post, showCount }: CommentProps) => {
  const count = post.stats.comments;
  const iconClassName = showCount ? "w-[20px]" : "w-[20px] sm:w-[18px]";
  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setParentPost } = usePostStore();
  const navigate = useNavigate();
  const canComment =
    post.operations?.canComment.__typename === "PostOperationValidationPassed";

  return (
    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-200">
      <button
        aria-label="Comment"
        className="rounded-full p-1.5 outline-offset-2 hover:bg-gray-300/20"
        onClick={() => {
          if (canComment) {
            setParentPost(post);
            setShowNewPostModal(true);
          } else {
            navigate(`/posts/${post.slug}`);
          }
        }}
        type="button"
      >
        <Tooltip
          content={count > 0 ? `${humanize(count)} Comments` : "Comment"}
          placement="top"
          withDelay
        >
          <ChatBubbleLeftIcon className={iconClassName} />
        </Tooltip>
      </button>
      {count > 0 && !showCount ? (
        <span className="w-3 text-sm sm:text-xs">{count}</span>
      ) : null}
    </div>
  );
};

export default memo(Comment);

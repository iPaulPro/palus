import { QueueListIcon } from "@heroicons/react/24/outline";
import type { AnyPostFragment } from "@palus/indexer";
import dayjs from "dayjs";
import { useLayoutEffect, useRef, useState } from "react";
import PostWarning from "@/components/Shared/Post/PostWarning";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { getBlockedByMeMessage } from "@/helpers/getBlockedMessage";
import { isRepost } from "@/helpers/postHelpers";
import { useHiddenCommentFeedStore } from ".";
import PostActions from "./Actions";
import HiddenPost from "./HiddenPost";
import PostAvatar from "./PostAvatar";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";
import PostStats from "./PostStats";
import PostType from "./Type";

interface FullPostProps {
  hasHiddenComments: boolean;
  post: AnyPostFragment;
}

const FullPost = ({ hasHiddenComments, post }: FullPostProps) => {
  const { setShowHiddenComments, showHiddenComments } =
    useHiddenCommentFeedStore();

  const headerRef = useRef<HTMLDivElement>(null);
  const [ignoreBlock, setIgnoreBlock] = useState(false);

  const targetPost = isRepost(post) ? post?.repostOf : post;
  const { timestamp } = targetPost;

  const isBlockedByMe = post.author.operations?.isBlockedByMe;
  const isComment = post.__typename === "Post" && post.commentOn;

  useLayoutEffect(() => {
    if (isComment && headerRef.current) {
      headerRef.current.scrollIntoView();
    }
  }, [isComment, headerRef.current]);

  if (isBlockedByMe && !ignoreBlock) {
    return (
      <PostWarning
        message={getBlockedByMeMessage(post.author)}
        setIgnoreBlock={setIgnoreBlock}
      />
    );
  }
  return (
    <article className="py-5 pr-5 pl-3 md:p-5">
      <PostType post={post} showType />
      <div className="flex w-full items-start gap-x-3" ref={headerRef}>
        <PostAvatar post={post} />
        <div className="w-full">
          <PostHeader post={targetPost} />
          {targetPost.isDeleted ? (
            <HiddenPost type={targetPost.__typename} />
          ) : (
            <>
              <PostBody
                contentClassName="full-page-post-markup"
                post={targetPost}
              />
              <div className="my-3 flex items-center text-gray-500 text-sm dark:text-gray-200">
                {dayjs(timestamp).format("h:mm A · MMM D, YYYY")}
                {targetPost.isEdited ? " · Edited" : null}
                {targetPost.app?.metadata?.name
                  ? ` · ${targetPost.app?.metadata?.name}`
                  : null}
              </div>
              <PostStats post={targetPost} />
              <div className="divider" />
              <div className="flex items-center justify-between">
                <PostActions post={targetPost} showCount />
                {hasHiddenComments ? (
                  <div className="mt-2">
                    <button
                      aria-label="Like"
                      className={cn(
                        showHiddenComments
                          ? "text-black hover:bg-gray-500/20"
                          : "text-gray-500 hover:bg-gray-300/20 dark:text-gray-200",
                        "rounded-full p-1.5 outline-offset-2"
                      )}
                      onClick={() => setShowHiddenComments(!showHiddenComments)}
                      type="button"
                    >
                      <Tooltip
                        content={
                          showHiddenComments
                            ? "Hide hidden comments"
                            : "Show hidden comments"
                        }
                        placement="top"
                        withDelay
                      >
                        <QueueListIcon className="size-5" />
                      </Tooltip>
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default FullPost;

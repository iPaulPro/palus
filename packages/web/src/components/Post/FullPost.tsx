import { QueueListIcon } from "@heroicons/react/24/outline";
import type { AnyPostFragment } from "@palus/indexer";
import dayjs from "dayjs";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import PostWarning from "@/components/Shared/Post/PostWarning";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import {
  getBlockedByMeMessage,
  getMutedByMeMessage
} from "@/helpers/getBlockedMessage";
import getPostData from "@/helpers/getPostData";
import { isRepost } from "@/helpers/postHelpers";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useHiddenCommentFeedStore } from ".";
import PostActions from "./Actions";
import BannedAuthorPost from "./BannedAuthorPost";
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
  const { bannedAccounts } = useBannedAccountsStore();

  const headerRef = useRef<HTMLDivElement>(null);
  const [ignoreBlock, setIgnoreBlock] = useState(false);
  const [ignoreMute, setIgnoreMute] = useState(false);

  const targetPost = isRepost(post) ? post?.repostOf : post;
  const { timestamp } = targetPost;

  const isBlockedByMe = post.author.operations?.isBlockedByMe;
  const isMutedByMe = post.author.operations?.isMutedByMe;
  const isComment = post.__typename === "Post" && post.commentOn;

  const media = getPostData(targetPost.metadata)?.asset;

  useLayoutEffect(() => {
    if (isComment && headerRef.current) {
      headerRef.current.scrollIntoView();
    }
  }, [isComment]);

  const handleDownloadMedia = useCallback(async () => {
    if (!media) return;
    const uri = media?.uri;
    if (!uri) return;

    const link = document.createElement("a");
    link.href = uri;
    link.download = post.id;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [media, post.id]);

  if (isBlockedByMe && !ignoreBlock) {
    return (
      <PostWarning
        message={getBlockedByMeMessage(post.author)}
        setIgnore={setIgnoreBlock}
      />
    );
  }

  if (isMutedByMe && !ignoreMute) {
    return (
      <PostWarning
        message={getMutedByMeMessage(post.author)}
        setIgnore={setIgnoreMute}
      />
    );
  }

  return (
    <article className="px-4 pt-5 pb-3 md:p-6 md:pb-4">
      <PostType post={post} showType />
      <div className="flex w-full items-start gap-x-3" ref={headerRef}>
        <PostAvatar post={post} />
        <div className="w-full min-w-0">
          <PostHeader post={targetPost} />
        </div>
      </div>
      <div className="pt-3">
        {targetPost.isDeleted ? (
          <HiddenPost type={targetPost.__typename} />
        ) : bannedAccounts.includes(post.author.address) ? (
          <BannedAuthorPost />
        ) : (
          <div className="flex flex-col sm:gap-y-1">
            <PostBody
              contentClassName="full-page-post-markup"
              post={targetPost}
            />
            <div className="flex items-center justify-between">
              <div className="my-3 flex items-center text-gray-500 text-sm dark:text-gray-200">
                {dayjs(timestamp).format("h:mm A · MMM D, YYYY")}
                {targetPost.isEdited ? " · Edited" : null}
                {targetPost.app?.metadata?.name
                  ? ` · ${targetPost.app?.metadata?.name}`
                  : null}
              </div>
              {targetPost.operations?.hasSimpleCollected && media ? (
                <button
                  className="font-semibold text-secondary text-sm hover:text-brand-500"
                  onClick={handleDownloadMedia}
                  type="button"
                >
                  Download media
                </button>
              ) : null}
            </div>
            <PostStats post={targetPost} />
            <div className="divider" />
            <div className="flex items-center justify-between">
              <PostActions
                post={targetPost}
                referrals={isRepost(post) ? [post.author.address] : undefined}
                showCount={false}
              />
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
          </div>
        )}
      </div>
    </article>
  );
};

export default FullPost;

import type { AnyPostFragment, TimelineItemFragment } from "@palus/indexer";
import { memo } from "react";
import ActionType from "@/components/Home/Timeline/EventType";
import { PinIconFilled } from "@/components/Shared/Icons/PinIconFilled";
import PostWrapper from "@/components/Shared/Post/PostWrapper";
import { Card } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import getAccount from "@/helpers/getAccount";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import PostActions from "./Actions";
import BannedAuthorPost from "./BannedAuthorPost";
import HiddenPost from "./HiddenPost";
import PostAvatar from "./PostAvatar";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";
import PostType from "./Type";

interface SinglePostProps {
  timelineItem?: TimelineItemFragment;
  post: AnyPostFragment;
  showMore?: boolean;
  showType?: boolean;
  embedded?: boolean;
  isPinned?: boolean;
}

const SinglePost = ({
  timelineItem,
  post,
  showMore = true,
  showType = true,
  embedded = false,
  isPinned = false
}: SinglePostProps) => {
  const rootPost = timelineItem ? timelineItem?.primary : post;
  const hasComments = Boolean(timelineItem?.comments?.length);
  const { bannedAccounts } = useBannedAccountsStore();

  return (
    <Card
      className={cn("mb-3 w-full sm:mb-5", {
        "mb-1 sm:mb-3": embedded || hasComments,
        "rounded-bl-xl": embedded
      })}
    >
      <PostWrapper
        className={cn("w-full cursor-pointer p-4 pb-3 sm:p-6 sm:pb-4", {
          "px-3 py-3 pb-2 sm:px-5 sm:py-4 sm:pb-3": embedded
        })}
        post={rootPost}
      >
        {timelineItem ? (
          <ActionType timelineItem={timelineItem} />
        ) : isPinned ? (
          <div className="text flex items-center gap-x-1.5 pb-2 text-secondary text-sm sm:-mt-1">
            <PinIconFilled className="size-4" />
            Pinned
          </div>
        ) : (
          <PostType post={post} showType={showType} />
        )}
        <div className="flex w-full gap-x-3">
          <div className="flex flex-none flex-col items-center">
            <PostAvatar
              post={rootPost}
              quoted={embedded}
              timelineItem={timelineItem}
            />
            {hasComments ? (
              <div className="w-[1px] flex-grow border-gray-200 border-l dark:border-gray-800" />
            ) : null}
          </div>
          <div className="w-full min-w-0">
            <PostHeader
              embedded={embedded}
              post={rootPost}
              timelineItem={timelineItem}
            />
          </div>
        </div>
        <div className={cn("pt-4", { "pt-2": embedded })}>
          {post.isDeleted ? (
            <HiddenPost type={post.__typename} />
          ) : bannedAccounts.includes(post.author.address) ? (
            <BannedAuthorPost />
          ) : (
            <>
              {embedded &&
              post.__typename === "Post" &&
              post.commentOn?.id !== post.root?.id ? (
                <div className="pb-1 text-secondary">
                  Reply to @{getAccount(post.commentOn?.author).username}
                </div>
              ) : null}
              <PostBody post={rootPost} showMore={showMore} />
              <PostActions embedded={embedded} post={rootPost} />
            </>
          )}
        </div>
      </PostWrapper>
    </Card>
  );
};

export default memo(SinglePost);

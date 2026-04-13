import type { AnyPostFragment, TimelineItemFragment } from "@palus/indexer";
import { memo } from "react";
import ActionType from "@/components/Home/Timeline/EventType";
import { PinIconFilled } from "@/components/Shared/Icons/PinIconFilled";
import PostWrapper from "@/components/Shared/Post/PostWrapper";
import { Card } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
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
      className={cn("mb-6 w-full", {
        "mb-4": embedded || hasComments
      })}
    >
      <PostWrapper
        className={cn("w-full cursor-pointer p-6 pb-5", {
          "px-5 py-4 pb-3": embedded
        })}
        post={rootPost}
      >
        {timelineItem ? (
          <ActionType timelineItem={timelineItem} />
        ) : isPinned ? (
          <div className="text flex items-center gap-x-1.5 pb-2 text-secondary text-sm">
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
          <div className="w-full">
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
              <PostBody post={rootPost} showMore={showMore} />
              <PostActions post={rootPost} />
            </>
          )}
        </div>
      </PostWrapper>
    </Card>
  );
};

export default memo(SinglePost);

import type { AnyPostFragment, TimelineItemFragment } from "@palus/indexer";
import { memo } from "react";
import ActionType from "@/components/Home/Timeline/EventType";
import { PinIconFilled } from "@/components/Shared/Icons/PinIconFilled";
import PostWrapper from "@/components/Shared/Post/PostWrapper";
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
    <PostWrapper
      className={cn("w-full cursor-pointer pt-4 pr-5", {
        "pb-3": !hasComments,
        "pl-2.5": embedded,
        "pl-3 md:pl-5": !embedded
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
      <div className="flex w-full gap-x-2">
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
          {post.isDeleted ? (
            <HiddenPost type={post.__typename} />
          ) : bannedAccounts.includes(post.author.address) ? (
            <BannedAuthorPost />
          ) : (
            <>
              <PostBody post={rootPost} showMore={showMore} />
              {embedded ? null : <PostActions post={rootPost} />}
            </>
          )}
        </div>
      </div>
    </PostWrapper>
  );
};

export default memo(SinglePost);

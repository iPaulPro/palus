import type { AnyPostFragment, TimelineItemFragment } from "@palus/indexer";
import { memo } from "react";
import ActionType from "@/components/Home/Timeline/EventType";
import PostWrapper from "@/components/Shared/Post/PostWrapper";
import cn from "@/helpers/cn";
import PostActions from "./Actions";
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
}

const SinglePost = ({
  timelineItem,
  post,
  showMore = true,
  showType = true,
  embedded = false
}: SinglePostProps) => {
  const rootPost = timelineItem ? timelineItem?.primary : post;
  const hasComments = Boolean(timelineItem?.comments?.length);

  return (
    <PostWrapper
      className={cn("w-full cursor-pointer pt-4 pr-5", {
        "pb-3": !hasComments,
        "pl-2.5": embedded,
        "pl-5": !embedded
      })}
      post={rootPost}
    >
      {timelineItem ? (
        <ActionType timelineItem={timelineItem} />
      ) : (
        <PostType post={post} showType={showType} />
      )}
      <div className="flex gap-x-3">
        <div className="flex flex-grow flex-col items-center">
          <PostAvatar post={rootPost} timelineItem={timelineItem} />
          {hasComments ? (
            <div className="w-[1px] flex-grow border-gray-200 border-l dark:border-gray-700" />
          ) : null}
        </div>
        <div className="w-[calc(100%-55px)]">
          <PostHeader post={rootPost} timelineItem={timelineItem} />
          {post.isDeleted ? (
            <HiddenPost type={post.__typename} />
          ) : (
            <>
              <PostBody post={rootPost} showMore={showMore} />
              <PostActions post={rootPost} />
            </>
          )}
        </div>
      </div>
    </PostWrapper>
  );
};

export default memo(SinglePost);

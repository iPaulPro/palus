import { UserGroupIcon } from "@heroicons/react/24/outline";
import {
  TimelineEventItemType,
  type TimelineRequest,
  useTimelineQuery
} from "@palus/indexer";
import { memo, useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import cn from "@/helpers/cn";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface TimelineProps {
  followingOnly: boolean;
}

const Timeline = ({ followingOnly }: TimelineProps) => {
  const { currentAccount } = useAccountStore();
  const request: TimelineRequest = {
    account: currentAccount?.address,
    ...(followingOnly && {
      filter: {
        eventType: [
          TimelineEventItemType.Post,
          TimelineEventItemType.Quote,
          TimelineEventItemType.Repost
        ]
      }
    })
  };

  const { data, error, fetchMore, loading } = useTimelineQuery({
    variables: { request }
  });

  const feed = data?.timeline?.items;
  const pageInfo = data?.timeline?.pageInfo;
  const hasMore = pageInfo?.next;

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const filteredPosts = useMemo(
    () =>
      (feed ?? []).filter(
        (timelineItem) =>
          !timelineItem.primary.author.operations?.isBlockedByMe &&
          !timelineItem.primary.operations?.hasReported
      ),
    [feed]
  );

  return (
    <PostFeed
      emptyIcon={<UserGroupIcon className="size-8" />}
      emptyMessage="No posts yet!"
      error={error}
      errorTitle="Failed to load timeline"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts}
      loading={loading}
      renderItem={(timelineItem) => {
        return (
          <>
            <SinglePost
              key={timelineItem.id}
              post={timelineItem.primary}
              timelineItem={timelineItem}
            />
            {timelineItem.comments.length === 0
              ? null
              : timelineItem.comments.map((comment, i) => (
                  <div className="flex pl-5" key={comment.id}>
                    <div
                      className={cn("flex w-11 flex-none justify-center", {
                        "pb-5": i === timelineItem.comments.length - 1
                      })}
                    >
                      <div className="h-full w-[1px] border-gray-200 border-l dark:border-gray-800" />
                    </div>
                    <SinglePost
                      embedded={true}
                      post={comment}
                      showMore={false}
                      showType={false}
                    />
                  </div>
                ))}
          </>
        );
      }}
    />
  );
};

export default memo(Timeline);

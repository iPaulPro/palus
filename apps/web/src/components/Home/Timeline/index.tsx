import { EyeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import {
  TimelineEventItemType,
  type TimelineRequest,
  useTimelineQuery
} from "@palus/indexer";
import { memo, useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import PostLink from "@/components/Shared/Post/PostLink";
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

  const { data, error, fetchMore, refetch, loading } = useTimelineQuery({
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
      kind="timeline"
      loading={loading}
      refetch={refetch}
      renderItem={(timelineItem) => {
        const commentsToShow = timelineItem.comments.slice(0, 3);
        const remainingCommentsCount = Math.max(
          0,
          timelineItem.comments.length - 3
        );

        return (
          <>
            <SinglePost
              key={timelineItem.id}
              post={timelineItem.primary}
              timelineItem={timelineItem}
            />
            {timelineItem.comments.length === 0
              ? null
              : commentsToShow.map((comment, i) => (
                  <div className="flex pl-4 last:pb-2" key={comment.id}>
                    <div
                      className={cn("flex w-9 flex-none justify-center", {
                        "pb-4":
                          i === commentsToShow.length - 1 &&
                          remainingCommentsCount === 0
                      })}
                    >
                      <div
                        className={cn(
                          "h-full w-[1px] border-gray-200 border-l dark:border-gray-800",
                          { "pt-2": i === 0 }
                        )}
                      />
                    </div>
                    <SinglePost
                      embedded={true}
                      post={comment}
                      showMore={true}
                      showType={false}
                    />
                  </div>
                ))}
            {remainingCommentsCount > 0 ? (
              <div className="flex pb-2 pl-3">
                <div className="flex w-11 flex-none justify-center pb-4">
                  <div className="h-full w-[1px] border-gray-200 border-l dark:border-gray-800" />
                </div>
                <PostLink
                  className="flex items-center gap-1 pt-2 pb-4 pl-2 font-bold text-gray-500 text-sm hover:underline dark:text-gray-200"
                  post={timelineItem.primary}
                >
                  <EyeIcon className="size-4" />
                  Show {remainingCommentsCount} other{" "}
                  {remainingCommentsCount === 1 ? "comment" : "comments"}
                </PostLink>
              </div>
            ) : null}
          </>
        );
      }}
    />
  );
};

export default memo(Timeline);

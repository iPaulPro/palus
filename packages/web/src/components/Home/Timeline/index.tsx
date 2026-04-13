import { UserGroupIcon } from "@heroicons/react/24/outline";
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
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

interface TimelineProps {
  onScroll?: (scrollOffset: number) => void;
}

const Timeline = ({ onScroll }: TimelineProps) => {
  const { currentAccount } = useAccountStore();
  const { includeCommentsInTimeline } = usePreferencesStore();
  const { bannedAccounts } = useBannedAccountsStore();

  const request: TimelineRequest = {
    account: currentAccount?.address,
    ...(!includeCommentsInTimeline && {
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
          !timelineItem.primary.author.operations?.isMutedByMe &&
          !timelineItem.primary.operations?.hasReported &&
          !bannedAccounts.includes(timelineItem.primary.author.address)
      ),
    [feed]
  );

  return (
    <PostFeed
      alwaysRestoreScroll={true}
      emptyIcon={<UserGroupIcon className="size-8" />}
      emptyMessage="No posts yet!"
      error={error}
      errorTitle="Failed to load timeline"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts}
      kind="timeline"
      loading={loading}
      onScroll={onScroll}
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
                  <div className="flex w-full pl-2 last:pb-2" key={comment.id}>
                    <div
                      className={cn("flex w-9 flex-none justify-center", {
                        "pb-4":
                          i === commentsToShow.length - 1 &&
                          remainingCommentsCount === 0
                      })}
                    >
                      <div
                        className={cn(
                          "mask-t-from-0 h-1/2 w-4 rounded-bl-xl border-gray-300 border-b border-l dark:border-gray-800",
                          { "pt-2": i === 0 }
                        )}
                      />
                    </div>
                    <SinglePost
                      embedded={true}
                      post={comment}
                      showType={false}
                    />
                  </div>
                ))}
            {remainingCommentsCount > 0 ? (
              <div className="flex pb-2 pl-4 md:pl-8">
                <PostLink
                  className="flex items-center gap-1 pt-2 pb-4 pl-3 font-semibold text-brand-500 text-brand-500 text-sm hover:underline"
                  post={timelineItem.primary}
                >
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

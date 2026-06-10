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
import getPostData from "@/helpers/getPostData";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

interface TimelineProps {
  onScroll?: (scrollOffset: number) => void;
}

const Timeline = ({ onScroll }: TimelineProps) => {
  const { currentAccount } = useAccountStore();
  const { includeCommentsInTimeline, hideShareImagePosts } =
    usePreferencesStore();
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
      (feed ?? []).filter((timelineItem) => {
        const post = timelineItem.primary;
        const postData = getPostData(post.metadata);
        return (
          !post.author.operations?.isBlockedByMe &&
          !post.author.operations?.isMutedByMe &&
          !post.operations?.hasReported &&
          !bannedAccounts.includes(post.author.address) &&
          !(
            hideShareImagePosts &&
            postData?.tags?.some(
              (tag) => tag === "palus-tip" || tag === "ORB-TIP"
            )
          )
        );
      }),
    [feed, bannedAccounts, hideShareImagePosts]
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
                  <div
                    className="flex w-full pl-4 last:pb-2 sm:pl-2"
                    key={comment.id}
                  >
                    <div
                      className={cn(
                        "hidden w-5 flex-none justify-center sm:flex sm:w-9",
                        {
                          "pb-4": i === commentsToShow.length - 1
                        }
                      )}
                    >
                      <div
                        className={cn(
                          "mask-t-from-0 h-1/2 w-3 rounded-bl-xl border-gray-300 border-b border-l sm:w-4 dark:border-gray-800",
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
          </>
        );
      }}
    />
  );
};

export default memo(Timeline);

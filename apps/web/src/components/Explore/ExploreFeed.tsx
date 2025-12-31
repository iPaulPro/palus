import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import {
  type MainContentFocus,
  PageSize,
  type PostsExploreRequest,
  usePostsExploreQuery
} from "@palus/indexer";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";

interface ExploreFeedProps {
  focus?: MainContentFocus;
  onScroll?: (scrollOffset: number) => void;
}

const ExploreFeed = ({ focus, onScroll }: ExploreFeedProps) => {
  const request: PostsExploreRequest = {
    ...(focus && {
      filter: {
        metadata: { mainContentFocus: [focus] },
        since: dayjs().subtract(2, "week").unix()
      }
    }),
    pageSize: PageSize.Fifty
  };

  const { data, error, fetchMore, loading, refetch } = usePostsExploreQuery({
    variables: { request }
  });

  const posts = data?.mlPostsExplore?.items;
  const pageInfo = data?.mlPostsExplore?.pageInfo;
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
      (posts ?? []).filter(
        (post) =>
          !post.author.operations?.isBlockedByMe &&
          !post.operations?.hasReported
      ),
    [posts]
  );

  return (
    <PostFeed
      emptyIcon={<ChatBubbleBottomCenterIcon className="size-8" />}
      emptyMessage="No posts yet!"
      error={error}
      errorTitle="Failed to load explore feed"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts}
      kind="explore"
      loading={loading}
      onScroll={onScroll}
      refetch={refetch}
      renderItem={(post) => <SinglePost key={post.id} post={post} />}
    />
  );
};

export default ExploreFeed;

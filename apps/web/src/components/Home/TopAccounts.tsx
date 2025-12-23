import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  PageSize,
  type PostFragment,
  type PostsRequest,
  PostType,
  usePostsQuery
} from "@palus/indexer";
import { useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";

const TopAccounts = () => {
  const request: PostsRequest = {
    filter: {
      accountScore: {
        atLeast: 9000
      },
      postTypes: [PostType.Root, PostType.Quote]
    },
    pageSize: PageSize.Fifty
  };

  const { data, error, fetchMore, loading, refetch } = usePostsQuery({
    variables: { request }
  });

  const posts = data?.posts.items;
  const pageInfo = data?.posts.pageInfo;
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
          post.__typename === "Post" &&
          !post.operations?.hasReported
      ),
    [posts]
  );

  return (
    <PostFeed
      emptyIcon={<LightBulbIcon className="size-8" />}
      emptyMessage="No posts found!"
      error={error}
      errorTitle="Failed to load top account posts"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts}
      kind="top-accounts"
      loading={loading}
      refetch={refetch}
      renderItem={(post) => (
        <SinglePost key={post.id} post={post as PostFragment} />
      )}
    />
  );
};

export default TopAccounts;

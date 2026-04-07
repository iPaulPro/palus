import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { PageSize, type PostsRequest, usePostsQuery } from "@palus/indexer";
import { useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import { isRepost } from "@/helpers/postHelpers";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";

interface PostsProps {
  query: string;
}

const Posts = ({ query }: PostsProps) => {
  const { bannedAccounts } = useBannedAccountsStore();

  const request: PostsRequest = {
    filter: { searchQuery: query },
    pageSize: PageSize.Fifty
  };

  const { data, error, fetchMore, loading, refetch } = usePostsQuery({
    variables: { request }
  });

  const posts = data?.posts?.items;
  const pageInfo = data?.posts?.pageInfo;
  const hasMore = pageInfo?.next;

  const filteredPosts = useMemo(
    () =>
      (posts ?? []).filter((post) => {
        const targetPost = isRepost(post) ? post.repostOf : post;
        return (
          !post.author.operations?.isBlockedByMe &&
          !post.author.operations?.isMutedByMe &&
          !targetPost.operations?.hasReported &&
          !bannedAccounts.includes(post.author.address)
        );
      }),
    [posts]
  );

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  return (
    <PostFeed
      emptyIcon={<ChatBubbleBottomCenterIcon className="size-8" />}
      emptyMessage={
        <span>
          No posts for <b>&ldquo;{query}&rdquo;</b>
        </span>
      }
      error={error}
      errorTitle="Failed to load posts"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts ?? []}
      kind="search"
      loading={loading}
      refetch={refetch}
      renderItem={(post) => <SinglePost key={post.id} post={post} />}
    />
  );
};

export default Posts;

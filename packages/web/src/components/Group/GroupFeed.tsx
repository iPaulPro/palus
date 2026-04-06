import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import {
  PageSize,
  type PostsRequest,
  PostType,
  usePostsQuery
} from "@palus/indexer";
import { useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import { isRepost } from "@/helpers/postHelpers";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";

interface GroupFeedProps {
  feed: string;
}

const GroupFeed = ({ feed }: GroupFeedProps) => {
  const { bannedAccounts } = useBannedAccountsStore();

  const request: PostsRequest = {
    filter: { feeds: [{ feed }], postTypes: [PostType.Root, PostType.Quote] },
    pageSize: PageSize.Fifty
  };

  const { data, error, fetchMore, loading, refetch } = usePostsQuery({
    skip: !feed,
    variables: { request }
  });

  const posts = data?.posts?.items;
  const pageInfo = data?.posts?.pageInfo;
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

  return (
    <PostFeed
      emptyIcon={<ChatBubbleBottomCenterIcon className="size-8" />}
      emptyMessage="Group has no posts yet!"
      error={error}
      errorTitle="Failed to load group feed"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts}
      kind="group"
      loading={loading}
      refetch={refetch}
      renderItem={(post) => <SinglePost key={post.id} post={post} />}
    />
  );
};

export default GroupFeed;

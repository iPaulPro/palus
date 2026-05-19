import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  PageSize,
  type PostFragment,
  type PostsForYouRequest,
  usePostsForYouQuery
} from "@palus/indexer";
import { memo, useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface ForYouProps {
  onScroll?: (scrollOffset: number) => void;
}

const ForYou = ({ onScroll }: ForYouProps) => {
  const { currentAccount } = useAccountStore();
  const { bannedAccounts } = useBannedAccountsStore();

  const request: PostsForYouRequest = useMemo(
    () => ({
      account: currentAccount?.address,
      pageSize: PageSize.Fifty,
      shuffle: true
    }),
    [currentAccount?.address]
  );

  const { data, error, fetchMore, loading, refetch } = usePostsForYouQuery({
    variables: { request }
  });

  const posts = data?.mlPostsForYou.items;
  const pageInfo = data?.mlPostsForYou.pageInfo;
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
      posts?.reduce<PostFragment[]>((acc, item) => {
        if (
          !item.post.author.operations?.isBlockedByMe &&
          !item.post.author.operations?.isMutedByMe &&
          !item.post.operations?.hasReported &&
          !bannedAccounts.includes(item.post.author.address)
        ) {
          acc.push(item.post);
        }
        return acc;
      }, []),
    [posts]
  );

  return (
    <PostFeed
      alwaysRestoreScroll={true}
      emptyIcon={<LightBulbIcon className="size-8" />}
      emptyMessage="No posts yet!"
      error={error}
      errorTitle="Failed to load for you"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts ?? []}
      kind="for-you"
      loading={loading}
      onScroll={onScroll}
      refetch={refetch}
      renderItem={(post) => <SinglePost key={post.id} post={post} />}
    />
  );
};

export default memo(ForYou);

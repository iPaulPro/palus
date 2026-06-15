import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  PageSize,
  type PostFragment,
  type PostsRequest,
  PostType,
  usePostsQuery
} from "@palus/indexer";
import { memo, useCallback, useMemo } from "react";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import { CONTRACTS } from "@/data/contracts";
import getPostData from "@/helpers/getPostData";
import { isRepost } from "@/helpers/postHelpers";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

interface AllPostsProps {
  onScroll?: (scrollOffset: number) => void;
}

const AllPosts = ({ onScroll }: AllPostsProps) => {
  const { bannedAccounts } = useBannedAccountsStore();
  const { hideHeyPosts, hideShareImagePosts } = usePreferencesStore();

  const request: PostsRequest = useMemo(
    () => ({
      filter: {
        postTypes: [PostType.Root, PostType.Quote]
      },
      pageSize: PageSize.Fifty
    }),
    []
  );

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
      (posts ?? []).filter((post) => {
        const targetPost = isRepost(post) ? post.repostOf : post;
        const postData = getPostData(targetPost.metadata);
        return (
          !post.author.operations?.isBlockedByMe &&
          !post.author.operations?.isMutedByMe &&
          !targetPost.operations?.hasReported &&
          !bannedAccounts.includes(post.author.address) &&
          !(
            hideShareImagePosts &&
            postData?.tags?.some(
              (tag) => tag === "palus-tip" || tag === "ORB-TIP"
            )
          ) &&
          !(hideHeyPosts && targetPost.app?.address === CONTRACTS.heyApp)
        );
      }),
    [posts, bannedAccounts, hideShareImagePosts, hideHeyPosts]
  );

  return (
    <PostFeed
      alwaysRestoreScroll={true}
      emptyIcon={<LightBulbIcon className="size-8" />}
      emptyMessage="No posts found!"
      error={error}
      errorTitle="Failed to load posts"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={filteredPosts}
      kind="all-posts"
      loading={loading}
      onScroll={onScroll}
      refetch={refetch}
      renderItem={(post) => (
        <SinglePost key={post.id} post={post as PostFragment} />
      )}
    />
  );
};

export default memo(AllPosts);

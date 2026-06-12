import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import {
  type AnyPostFragment,
  MainContentFocus,
  PageSize,
  type PostsRequest,
  PostType,
  usePostLazyQuery,
  usePostsQuery
} from "@palus/indexer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import SinglePost from "@/components/Post/SinglePost";
import PostFeed from "@/components/Shared/Post/PostFeed";
import { pinPostAccountActionAbi } from "@/data/abis/pinPostAccountActionAbi";
import { CHAIN } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { AccountFeedType } from "@/data/enums";
import { isRepost } from "@/helpers/postHelpers";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";

interface AccountFeedProps {
  username: string;
  address: string;
  type:
    | AccountFeedType.Collects
    | AccountFeedType.Feed
    | AccountFeedType.Media
    | AccountFeedType.Replies;
}

const EMPTY_MESSAGES: Record<AccountFeedType, string> = {
  [AccountFeedType.Feed]: "has nothing in their feed yet!",
  [AccountFeedType.Media]: "has no media yet!",
  [AccountFeedType.Replies]: "hasn't replied yet!",
  [AccountFeedType.Collects]: "hasn't collected anything yet!"
};

const AccountFeed = ({ username, address, type }: AccountFeedProps) => {
  const { bannedAccounts } = useBannedAccountsStore();

  const [pinnedPost, setPinnedPost] = useState<AnyPostFragment | null>(null);

  const postTypes = useMemo(() => {
    switch (type) {
      case AccountFeedType.Feed:
        return [PostType.Root, PostType.Repost, PostType.Quote];
      case AccountFeedType.Replies:
        return [PostType.Comment];
      case AccountFeedType.Media:
        return [PostType.Root, PostType.Quote];
      default:
        return [
          PostType.Root,
          PostType.Comment,
          PostType.Repost,
          PostType.Quote
        ];
    }
  }, [type]);

  const getEmptyMessage = () => {
    return EMPTY_MESSAGES[type] || "";
  };

  const request = useMemo<PostsRequest>(
    () => ({
      filter: {
        postTypes,
        ...(type === AccountFeedType.Media && {
          metadata: {
            mainContentFocus: [
              MainContentFocus.Image,
              MainContentFocus.Audio,
              MainContentFocus.Video,
              MainContentFocus.ShortVideo
            ]
          }
        }),
        ...(type === AccountFeedType.Collects
          ? { collectedBy: { account: address } }
          : { authors: [address] })
      },
      pageSize: PageSize.Fifty
    }),
    [address, postTypes, type]
  );

  const { data, error, fetchMore, loading, refetch } = usePostsQuery({
    skip: !address,
    variables: { request }
  });

  const [getPost] = usePostLazyQuery();

  const { data: pinnedPostId } = useReadContract({
    abi: pinPostAccountActionAbi,
    address: CONTRACTS.pinPostAccountAction,
    args: [address as `0x${string}`],
    chainId: CHAIN.id,
    functionName: "pinnedPosts"
  });

  useEffect(() => {
    if (!pinnedPostId) {
      setPinnedPost(null);
      return;
    }

    const getPinnedPost = async () => {
      const { data } = await getPost({
        variables: {
          request: {
            post: pinnedPostId.toString()
          }
        }
      });
      setPinnedPost(data?.post ?? null);
    };

    getPinnedPost();
  }, [pinnedPostId]);

  // Filter out quote comments from the main feed
  const posts = data?.posts?.items.filter((post) =>
    type === AccountFeedType.Feed && post.__typename === "Post"
      ? !post.commentOn
      : post.__typename === "Post" && post.commentOn
        ? !bannedAccounts.includes(post.commentOn.author.address)
        : !bannedAccounts.includes(post.author.address)
  );
  const pageInfo = data?.posts?.pageInfo;
  const hasMore = pageInfo?.next;

  const safePosts = (posts ?? []) as AnyPostFragment[];

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
        <div>
          <b className="mr-1">{username}</b>
          <span>{getEmptyMessage()}</span>
        </div>
      }
      error={error}
      errorTitle="Failed to load account feed"
      handleEndReached={handleEndReached}
      hasMore={hasMore}
      items={safePosts}
      kind="account"
      loading={loading}
      pin={
        pinnedPost && type === AccountFeedType.Feed ? (
          <SinglePost isPinned post={pinnedPost} />
        ) : null
      }
      refetch={refetch}
      renderItem={(post) => (
        <SinglePost
          key={post.id}
          post={post}
          referrals={isRepost(post) ? [post.author.address] : undefined}
        />
      )}
    />
  );
};

export default AccountFeed;

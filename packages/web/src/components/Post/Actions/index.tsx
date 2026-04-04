import type { AnyPostFragment } from "@palus/indexer";
import { memo } from "react";
import CollectAction from "@/components/Post/OpenAction/CollectAction";
import SmallCollectButton from "@/components/Post/OpenAction/CollectAction/SmallCollectButton";
import TipAction from "@/components/Post/OpenAction/TipAction";
import cn from "@/helpers/cn";
import { isRepost } from "@/helpers/postHelpers";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import Comment from "./Comment";
import Like from "./Like";
import ShareMenu from "./Share";

interface PostActionsProps {
  post: AnyPostFragment;
  showCount?: boolean;
}

const PostActions = ({ post, showCount = true }: PostActionsProps) => {
  const { currentAccount } = useAccountStore();
  const targetPost = isRepost(post) ? post.repostOf : post;
  const hasPostAction = (targetPost.actions?.length || 0) > 0;
  const hasCollectAction =
    hasPostAction &&
    targetPost.actions.some(
      (action) => action.__typename === "SimpleCollectAction"
    );
  const canRepost =
    targetPost.operations?.canRepost.__typename ===
    "PostOperationValidationPassed";
  const canQuote =
    targetPost.operations?.canQuote.__typename ===
    "PostOperationValidationPassed";
  const showShareMenu = canRepost || canQuote;
  const isPostFromCurrentAccount =
    currentAccount?.address === targetPost.author.address;

  return (
    <span
      className="mt-3 flex w-full flex-wrap items-center justify-between gap-3"
      onClick={stopEventPropagation}
    >
      <span
        className={cn("flex flex-grow flex-wrap items-center", {
          "gap-x-4 sm:gap-x-5":
            showCount &&
            (!showShareMenu || !hasCollectAction || isPostFromCurrentAccount),
          "gap-x-7": !showCount,
          "justify-between pr-2 sm:justify-start sm:gap-x-6":
            showCount &&
            showShareMenu &&
            hasCollectAction &&
            !isPostFromCurrentAccount
        })}
      >
        <Comment post={targetPost} showCount={showCount} />
        <ShareMenu post={post} showCount={showCount} />
        <Like
          currentAccount={currentAccount}
          post={targetPost}
          showCount={showCount}
        />
        <TipAction
          currentAccount={currentAccount}
          post={targetPost}
          showCount={showCount}
        />
        {hasCollectAction ? (
          <CollectAction post={targetPost} showCount={showCount} />
        ) : null}
      </span>
      {!showCount && hasCollectAction ? (
        <div className="hidden sm:flex sm:pr-2">
          <SmallCollectButton post={targetPost} />
        </div>
      ) : null}
    </span>
  );
};

export default memo(PostActions);

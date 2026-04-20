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
  embedded?: boolean;
}

const PostActions = ({
  post,
  showCount = true,
  embedded
}: PostActionsProps) => {
  const { currentAccount } = useAccountStore();
  const targetPost = isRepost(post) ? post.repostOf : post;
  const hasPostAction = (targetPost.actions?.length || 0) > 0;
  const hasCollectAction =
    hasPostAction &&
    targetPost.actions.some(
      (action) => action.__typename === "SimpleCollectAction"
    );

  return (
    <span
      className={cn(
        "mt-2 flex w-full flex-wrap items-center justify-between gap-3 sm:mt-4",
        {
          "mt-3": showCount && !embedded
        }
      )}
      onClick={stopEventPropagation}
    >
      <div
        className={cn("items-center", {
          "flex flex-grow flex-wrap gap-x-7": !showCount,
          "flex w-full justify-between pr-2 sm:justify-start sm:gap-x-7 sm:pr-0":
            showCount
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
        ) : (
          <div className="block size-8 sm:hidden" />
        )}
      </div>
      {!showCount && hasCollectAction ? (
        <div className="hidden sm:flex sm:pr-2">
          <SmallCollectButton post={targetPost} />
        </div>
      ) : null}
    </span>
  );
};

export default memo(PostActions);

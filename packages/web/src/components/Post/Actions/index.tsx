import type { AnyPostFragment } from "@palus/indexer";
import { memo } from "react";
import CollectAction from "@/components/Post/OpenAction/CollectAction";
import SmallCollectButton from "@/components/Post/OpenAction/CollectAction/SmallCollectButton";
import TipAction from "@/components/Post/OpenAction/TipAction";
import { isRepost } from "@/helpers/postHelpers";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import Comment from "./Comment";
import Like from "./Like";
import ShareMenu from "./Share";

interface PostActionsProps {
  post: AnyPostFragment;
  showCount?: boolean;
}

const PostActions = ({ post, showCount = false }: PostActionsProps) => {
  const targetPost = isRepost(post) ? post.repostOf : post;
  const hasPostAction = (targetPost.actions?.length || 0) > 0;
  const hasCollectAction =
    hasPostAction &&
    targetPost.actions.some(
      (action) => action.__typename === "SimpleCollectAction"
    );

  return (
    <span
      className="mt-3 flex w-full flex-wrap items-center justify-between gap-3"
      onClick={stopEventPropagation}
    >
      <span
        className={`flex w-full items-center ${showCount ? "gap-x-6" : "gap-x-5"}`}
      >
        <Comment post={targetPost} showCount={showCount} />
        <ShareMenu post={post} showCount={showCount} />
        <Like post={targetPost} showCount={showCount} />
        <TipAction post={targetPost} showCount={showCount} />
        {hasCollectAction ? (
          <CollectAction post={targetPost} showCount={showCount} />
        ) : null}
        {showCount && hasCollectAction ? (
          <div className="hidden w-full justify-end pr-2 sm:flex">
            <SmallCollectButton post={targetPost} />
          </div>
        ) : null}
      </span>
    </span>
  );
};

export default memo(PostActions);

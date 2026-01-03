import type { AnyPostFragment } from "@palus/indexer";
import { memo } from "react";
import CollectAction from "@/components/Post/OpenAction/CollectAction";
import TipAction from "@/components/Post/OpenAction/TipAction";
import cn from "@/helpers/cn";
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
  const canAct =
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
        className={cn("flex items-center md:gap-x-6", {
          "gap-x-5": canAct,
          "gap-x-6": !canAct
        })}
      >
        <Comment post={targetPost} showCount={showCount} />
        <ShareMenu post={post} showCount={showCount} />
        <Like post={targetPost} showCount={showCount} />
        <TipAction post={targetPost} showCount={showCount} />
        <CollectAction post={targetPost} showCount={showCount} />
      </span>
    </span>
  );
};

export default memo(PostActions);

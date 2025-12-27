import type { PostFragment } from "@palus/indexer";
import { memo } from "react";
import PostWrapper from "@/components/Shared/Post/PostWrapper";
import cn from "@/helpers/cn";
import PostActions from "./Actions";
import HiddenPost from "./HiddenPost";
import PostAvatar from "./PostAvatar";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";

interface ThreadBodyProps {
  post: PostFragment;
  isRoot?: boolean;
  embedded?: boolean;
}

const ThreadBody = ({ post, isRoot, embedded }: ThreadBodyProps) => {
  return (
    <PostWrapper post={post}>
      <div className="relative flex items-start gap-x-3 pb-3">
        <PostAvatar post={post} />
        <div
          className={cn("absolute bottom-0 left-[21px] h-full", {
            "border-[0.9px] border-gray-300 border-solid dark:border-gray-800":
              !isRoot,
            "left-dash text-gray-300 dark:text-gray-800": isRoot
          })}
        />
        <div className="w-[calc(100%-55px)]">
          <PostHeader embedded={embedded} post={post} />
          {post.isDeleted ? (
            <HiddenPost type={post.__typename} />
          ) : (
            <>
              <PostBody embedded={embedded} post={post} />
              {embedded ? null : <PostActions post={post} />}
            </>
          )}
        </div>
      </div>
    </PostWrapper>
  );
};

export default memo(ThreadBody);

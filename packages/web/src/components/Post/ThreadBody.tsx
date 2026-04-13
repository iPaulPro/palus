import type { PostFragment } from "@palus/indexer";
import { memo } from "react";
import PostWrapper from "@/components/Shared/Post/PostWrapper";
import cn from "@/helpers/cn";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import PostActions from "./Actions";
import BannedAuthorPost from "./BannedAuthorPost";
import HiddenPost from "./HiddenPost";
import PostAvatar from "./PostAvatar";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";

interface ThreadBodyProps {
  post: PostFragment;
  isRoot?: boolean;
  embedded?: boolean;
  showMore?: boolean;
}

const ThreadBody = ({
  post,
  isRoot,
  embedded,
  showMore = true
}: ThreadBodyProps) => {
  const { bannedAccounts } = useBannedAccountsStore();

  return (
    <PostWrapper
      className="w-full cursor-pointer"
      disableClick={embedded}
      post={post}
    >
      <div className="relative flex w-full items-start gap-x-3 pb-3">
        <PostAvatar post={post} />
        <div
          className={cn("absolute bottom-0 left-[21px] h-full", {
            "border-[0.9px] border-gray-300 border-solid dark:border-gray-800":
              !isRoot,
            "left-dash text-gray-400 dark:text-gray-700": isRoot
          })}
        />
        <div className="w-full">
          <PostHeader embedded={embedded} post={post} />
          {post.isDeleted ? (
            <HiddenPost type={post.__typename} />
          ) : bannedAccounts.includes(post.author.address) ? (
            <BannedAuthorPost />
          ) : (
            <div className="pt-4">
              <PostBody embedded={embedded} post={post} showMore={showMore} />
              {embedded ? null : <PostActions post={post} />}
            </div>
          )}
        </div>
      </div>
    </PostWrapper>
  );
};

export default memo(ThreadBody);

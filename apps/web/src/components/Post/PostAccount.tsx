import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { TRANSFORMS } from "@palus/data/constants";
import type {
  AccountFragment,
  AnyPostFragment,
  PostGroupInfoFragment
} from "@palus/indexer";
import { memo } from "react";
import { Link } from "react-router";
import AccountLink from "@/components/Shared/Account/AccountLink";
import AccountPreview from "@/components/Shared/Account/AccountPreview";
import TopAccount from "@/components/Shared/Badges/TopAccount";
import PostLink from "@/components/Shared/Post/PostLink";
import { Image } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";

interface PostAccountProps {
  account: AccountFragment;
  group?: PostGroupInfoFragment;
  post: AnyPostFragment;
  timestamp: Date;
}

const PostAccount = ({ account, group, post, timestamp }: PostAccountProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-1.5">
        <AccountLink
          account={account}
          className="outline-hidden hover:underline focus:underline"
        >
          <AccountPreview
            address={account.address}
            showUserPreview
            username={account.username?.localName}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-x-1">
              <div className="flex items-center gap-x-0.5">
                <span className="line-clamp-1 font-semibold">
                  {getAccount(account).name}
                </span>
                {account.score < 9000 ? null : <TopAccount />}
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                @{getAccount(account).username}
              </span>
            </div>
          </AccountPreview>
        </AccountLink>
        {group?.metadata ? (
          <>
            <ChevronRightIcon
              className="size-3 text-secondary"
              strokeWidth={3}
            />
            <Link
              className="flex items-center gap-x-1 hover:underline focus:underline"
              to={`/g/${group.address}`}
            >
              <Image
                alt={group.metadata.name}
                className="size-4 rounded-sm"
                src={getAvatar(group, TRANSFORMS.AVATAR_TINY)}
              />
              <span className="truncate text-sm">{group.metadata.name}</span>
            </Link>
          </>
        ) : null}
        {timestamp ? (
          <span className="text-gray-500 dark:text-gray-200">
            &#8729;{" "}
            <PostLink className="text-sm hover:underline" post={post}>
              {formatRelativeOrAbsolute(timestamp)}
            </PostLink>
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default memo(PostAccount);

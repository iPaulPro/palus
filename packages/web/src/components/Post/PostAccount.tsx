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
import GroupPreview from "@/components/Shared/Group/GroupPreview";
import PostLink from "@/components/Shared/Post/PostLink";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import getAccount from "@/helpers/getAccount";

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
      </div>
      <div className="flex flex-wrap items-center gap-x-1 text-secondary text-sm">
        {timestamp ? (
          <PostLink className="hover:underline" post={post}>
            <Tooltip content={new Date(timestamp).toLocaleString()}>
              {formatRelativeOrAbsolute(timestamp, "ago")}
            </Tooltip>
          </PostLink>
        ) : null}
        {group?.metadata ? (
          <div className="flex items-center gap-x-1">
            <span>in</span>
            <Link
              className="hover:underline focus:underline"
              to={`/g/${group.address}`}
            >
              <GroupPreview
                address={group.address}
                className="flex items-center gap-x-1"
                name={group.metadata?.name}
              >
                <span className="truncate">#{group.metadata.name}</span>
              </GroupPreview>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default memo(PostAccount);

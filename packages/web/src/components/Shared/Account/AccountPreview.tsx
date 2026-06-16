import {
  type AccountFragment,
  type AccountStats,
  useFullAccountLazyQuery
} from "@palus/indexer";
import plur from "plur";
import { HoverCard } from "radix-ui";
import type { ReactNode } from "react";
import TopAccount from "@/components/Shared/Badges/TopAccount";
import Markup from "@/components/Shared/Markup";
import Slug from "@/components/Shared/Slug";
import { Card, Image } from "@/components/Shared/UI";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import getMentions from "@/helpers/getMentions";
import nFormatter from "@/helpers/nFormatter";
import truncateByWords from "@/helpers/truncateByWords";
import FollowUnfollowButton from "./FollowUnfollowButton";

interface AccountPreviewProps {
  children: ReactNode;
  username?: string;
  address?: string;
  showUserPreview?: boolean;
}

const UserAvatar = ({ account }: { account: AccountFragment }) => (
  <Image
    alt={account.address}
    className="size-12 rounded-full border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
    height={48}
    loading="lazy"
    src={getAvatar(account)}
    width={48}
  />
);

const UserName = ({ account }: { account: AccountFragment }) => (
  <div>
    <div className="flex min-w-0 max-w-sm items-center gap-1">
      <div className="truncate">{getAccount(account).name}</div>
      {account.score < 9000 ? null : <TopAccount />}
    </div>
    <span>
      <Slug
        className="text-sm"
        prefix="@"
        slug={getAccount(account).username}
      />
      {account.operations?.isFollowingMe && (
        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
          Follows you
        </span>
      )}
    </span>
  </div>
);

const Preview = ({
  account,
  address,
  loading,
  stats,
  username
}: {
  account: AccountFragment | undefined | null;
  address?: string;
  loading: boolean;
  stats: AccountStats;
  username?: string;
}) => {
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex p-3">
          <div>{username || `#${address}`}</div>
        </div>
      </div>
    );
  }

  if (!account) {
    return <div className="flex h-12 items-center px-3">No account found</div>;
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <UserAvatar account={account} />
        <FollowUnfollowButton account={account} small />
      </div>
      <UserName account={account} />
      {account.metadata?.bio && (
        <Markup
          className="linkify markup wrap-break-word mt-2 text-sm leading-6"
          mentions={getMentions(account.metadata.bio)}
        >
          {truncateByWords(account.metadata.bio, 20)}
        </Markup>
      )}
      <div className="mt-4 flex items-center gap-x-3">
        <div className="flex items-center gap-x-1">
          <div className="text-base">
            {nFormatter(stats.graphFollowStats?.following)}
          </div>
          <div className="text-gray-500 text-sm dark:text-gray-200">
            Following
          </div>
        </div>
        <div className="flex items-center gap-x-1">
          <div className="text-base">
            {nFormatter(stats.graphFollowStats?.followers)}
          </div>
          <div className="text-gray-500 text-sm dark:text-gray-200">
            {plur("Follower", stats.graphFollowStats?.followers)}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountPreview = ({
  children,
  username,
  address,
  showUserPreview = true
}: AccountPreviewProps) => {
  const [loadAccount, { data, loading }] = useFullAccountLazyQuery();
  const account = data?.account;
  const stats = data?.accountStats as AccountStats;

  const onPreviewStart = async () => {
    if (account || loading) {
      return;
    }

    await loadAccount({
      variables: {
        accountRequest: {
          ...(address
            ? { address }
            : { username: { localName: username as string } })
        },
        accountStatsRequest: {
          ...(address
            ? { account: address }
            : { username: { localName: username as string } })
        }
      }
    });
  };

  if (!address && !username) {
    return null;
  }

  if (!showUserPreview) {
    return <span>{children}</span>;
  }

  return (
    <span onFocus={onPreviewStart} onMouseOver={onPreviewStart}>
      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <span className="min-w-0">{children}</span>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            asChild
            className="z-10 w-72"
            side="bottom"
            sideOffset={5}
          >
            <div>
              <Card forceRounded>
                <Preview
                  account={account}
                  address={address}
                  loading={loading}
                  stats={stats}
                  username={username}
                />
              </Card>
            </div>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </span>
  );
};

export default AccountPreview;

import { Square2StackIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import { memo, type ReactNode } from "react";
import TopAccount from "@/components/Shared/Badges/TopAccount";
import Markup from "@/components/Shared/Markup";
import Slug from "@/components/Shared/Slug";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import formatAddress from "@/helpers/formatAddress";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import getMentions from "@/helpers/getMentions";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import AccountLink from "./AccountLink";
import AccountPreview from "./AccountPreview";
import FollowUnfollowButton from "./FollowUnfollowButton";

interface SingleAccountProps {
  className?: string;
  hideFollowButton?: boolean;
  hideUnfollowButton?: boolean;
  isBig?: boolean;
  isVerified?: boolean;
  linkToAccount?: boolean;
  account: AccountFragment;
  showBio?: boolean;
  showUserPreview?: boolean;
  showAddress?: boolean;
  action?: ReactNode;
}

const SingleAccount = ({
  className,
  hideFollowButton = false,
  hideUnfollowButton = false,
  isBig = false,
  linkToAccount = true,
  account,
  showBio = false,
  showUserPreview = true,
  showAddress = false,
  action
}: SingleAccountProps) => {
  const UserAvatar = () => (
    <Image
      alt={account.address}
      className={cn(
        isBig ? "size-14" : "size-11",
        "flex-none rounded-full border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
      )}
      height={isBig ? 56 : 44}
      loading="lazy"
      src={getAvatar(account)}
      width={isBig ? 56 : 44}
    />
  );

  const copyAddress = useCopyToClipboard(
    account.address,
    "Address copied to clipboard!"
  );

  const UserName = () => (
    <div className="min-w-0">
      <div
        className={cn("flex min-w-0 flex-col", {
          "flex gap-x-1": showAddress
        })}
      >
        <div
          className={cn(
            { "font-bold": isBig },
            "flex min-w-0 max-w-sm items-center gap-x-0.5"
          )}
        >
          <div className="truncate font-semibold">
            {getAccount(account).name}
          </div>
          {account.score < 9000 ? null : <TopAccount />}
        </div>
        <Slug
          className="truncate text-sm"
          prefix="@"
          slug={getAccount(account).username}
        />
      </div>
      {showAddress && (
        <div className="flex items-center gap-x-1 text-sm">
          {formatAddress(account.address)}
          <Square2StackIcon
            className="size-4 cursor-pointer hover:text-brand-500"
            onClick={copyAddress}
          />
        </div>
      )}
    </div>
  );

  const AccountInfo = () => (
    <AccountPreview
      address={account.address}
      showUserPreview={showUserPreview}
      username={account.username?.localName}
    >
      <div className="flex items-center gap-x-3">
        <UserAvatar />
        <UserName />
      </div>
    </AccountPreview>
  );

  return (
    <div className={cn("flex min-w-0 flex-col gap-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        {linkToAccount && account.address ? (
          <AccountLink account={account} className="min-w-0">
            <AccountInfo />
          </AccountLink>
        ) : (
          <AccountInfo />
        )}
        <div className="flex items-center gap-x-2">
          <FollowUnfollowButton
            account={account}
            hideFollowButton={hideFollowButton}
            hideUnfollowButton={hideUnfollowButton}
            small
          />
          {action}
        </div>
      </div>
      {showBio && account?.metadata?.bio && (
        <div
          className={cn(
            isBig ? "text-base" : "text-sm",
            "mt-2",
            "linkify leading-6"
          )}
          style={{ wordBreak: "break-word" }}
        >
          <Markup mentions={getMentions(account.metadata.bio)}>
            {account?.metadata.bio}
          </Markup>
        </div>
      )}
    </div>
  );
};

export default memo(SingleAccount);

import type { AccountFragment } from "@palus/indexer";
import { memo } from "react";
import TopAccount from "@/components/Shared/Badges/TopAccount";
import Slug from "@/components/Shared/Slug";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import AccountLink from "./AccountLink";

interface SmallSingleAccountProps {
  hideSlug?: boolean;
  linkToAccount?: boolean;
  account: AccountFragment;
  smallAvatar?: boolean;
  timestamp?: Date;
}

const UserAvatar = (props: SmallSingleAccountProps) => {
  const { account, smallAvatar } = props;

  return (
    <Image
      alt={account.address}
      className={cn(
        smallAvatar ? "size-4" : "size-6",
        "rounded-full border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
      )}
      height={smallAvatar ? 16 : 24}
      loading="lazy"
      src={getAvatar(account)}
      width={smallAvatar ? 16 : 24}
    />
  );
};

const UserName = (props: SmallSingleAccountProps) => {
  const { hideSlug, account, timestamp } = props;
  return (
    <div className="flex max-w-full flex-wrap items-center">
      <div
        className={cn(
          !hideSlug && "max-w-[75%]",
          "mr-1 flex items-center gap-x-0.5 truncate"
        )}
      >
        {getAccount(account).name}
        {account.score < 9000 ? null : <TopAccount />}
      </div>
      {!hideSlug && (
        <Slug
          className="text-sm"
          prefix="@"
          slug={getAccount(account).username}
        />
      )}
      {timestamp && (
        <span className="text-gray-500 dark:text-gray-200">
          <span className="mx-1.5">·</span>
          <span className="text-xs">{formatRelativeOrAbsolute(timestamp)}</span>
        </span>
      )}
    </div>
  );
};

const AccountInfo = (props: SmallSingleAccountProps) => (
  <div className="flex items-center space-x-1">
    <UserAvatar {...props} />
    <UserName {...props} />
  </div>
);

const SmallSingleAccount = (props: SmallSingleAccountProps) => {
  const { account, linkToAccount } = props;
  return linkToAccount ? (
    <AccountLink account={account}>
      <AccountInfo {...props} />
    </AccountLink>
  ) : (
    <AccountInfo {...props} />
  );
};

export default memo(SmallSingleAccount);

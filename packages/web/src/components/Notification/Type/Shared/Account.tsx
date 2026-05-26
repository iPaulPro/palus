import type { AccountFragment } from "@palus/indexer";
import { memo } from "react";
import AccountLink from "@/components/Shared/Account/AccountLink";
import AccountPreview from "@/components/Shared/Account/AccountPreview";
import TopAccount from "@/components/Shared/Badges/TopAccount";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface NotificationAccountProps {
  account: AccountFragment;
  bold?: boolean;
}

export const NotificationAccountAvatar = memo(
  ({ account }: NotificationAccountProps) => {
    return (
      <AccountPreview
        address={account.address}
        username={account.username?.localName}
      >
        <AccountLink
          account={account}
          className="flex rounded-full outline-offset-2"
          onClick={stopEventPropagation}
        >
          <Image
            alt={account.address}
            className="size-7 flex-none rounded-full border border-gray-200 bg-gray-200 object-cover sm:size-8 dark:border-gray-800"
            height={32}
            src={getAvatar(account)}
            width={32}
          />
        </AccountLink>
      </AccountPreview>
    );
  }
);

export const NotificationAccountName = memo(
  ({ account, bold = true }: NotificationAccountProps) => {
    return (
      <AccountPreview
        address={account.address}
        username={account.username?.localName}
      >
        <AccountLink
          account={account}
          className={cn(
            "inline-flex min-w-0 items-center gap-0.5 outline-hidden hover:underline focus:underline",
            bold ? "font-bold" : "w-full"
          )}
          onClick={stopEventPropagation}
        >
          <span className="truncate">{getAccount(account).name}</span>
          {account.score < 9000 ? null : <TopAccount />}
        </AccountLink>
      </AccountPreview>
    );
  }
);

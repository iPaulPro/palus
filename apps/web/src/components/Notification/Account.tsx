import getAccount from "@palus/helpers/getAccount";
import getAvatar from "@palus/helpers/getAvatar";
import type { AccountFragment } from "@palus/indexer";
import { memo } from "react";
import AccountLink from "@/components/Shared/Account/AccountLink";
import AccountPreview from "@/components/Shared/Account/AccountPreview";
import { Image } from "@/components/Shared/UI";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface NotificationAccountProps {
  account: AccountFragment;
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
          className="rounded-full outline-offset-2"
          onClick={stopEventPropagation}
        >
          <Image
            alt={account.address}
            className="size-7 rounded-full border border-gray-200 bg-gray-200 sm:size-8 dark:border-gray-800"
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
  ({ account }: NotificationAccountProps) => {
    return (
      <AccountPreview
        address={account.address}
        username={account.username?.localName}
      >
        <AccountLink
          account={account}
          className="inline-flex items-center gap-1 font-bold outline-hidden hover:underline focus:underline"
          onClick={stopEventPropagation}
        >
          <span>{getAccount(account).name}</span>
        </AccountLink>
      </AccountPreview>
    );
  }
);

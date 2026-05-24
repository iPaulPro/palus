import { UserPlusIcon } from "@heroicons/react/24/outline";
import type { FollowNotificationFragment } from "@palus/indexer";
import plur from "plur";
import { memo } from "react";
import {
  NotificationAccountAvatar,
  NotificationAccountName
} from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import ExpandableNotification from "@/components/Notification/Type/Shared/ExpandableNotification";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import getAccount from "@/helpers/getAccount";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { NotificationProps } from "@/types/palus";

const FollowNotification = ({
  notification,
  isNew
}: NotificationProps<FollowNotificationFragment>) => {
  const { currentAccount } = useAccountStore();
  const seen = new Set<string>();
  const followers = notification.followers.filter((f) => {
    if (seen.has(f.account.address)) return false;
    seen.add(f.account.address);
    return true;
  });
  const firstAccount = followers?.[0];
  const length = followers.length - 1;
  const moreThanOneAccount = length > 0;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} followed`
    : "followed";
  const type = "you";
  const isSingle = followers.length === 1;

  return (
    <ExpandableNotification
      avatars={followers.slice(0, 10).map((follower) => (
        <div className="not-first:-ml-2" key={follower.account.address}>
          <NotificationAccountAvatar account={follower.account} />
        </div>
      ))}
      expandable={!isSingle}
      icon={<UserPlusIcon className="size-6" />}
      isNew={isNew}
      timestamp={isSingle ? followers[0].followedAt : undefined}
      title={
        <AggregatedNotificationTitle
          firstAccount={firstAccount.account}
          linkToType={getAccount(currentAccount).link}
          text={text}
          type={type}
        />
      }
    >
      {followers.map((follower) => (
        <div
          className="flex items-center justify-between"
          key={follower.account.address}
        >
          <div className="flex items-center gap-x-2">
            <NotificationAccountAvatar account={follower.account} />
            <NotificationAccountName account={follower.account} bold={false} />
          </div>
          <Timestamp isNew={false} timestamp={follower.followedAt} />
        </div>
      ))}
    </ExpandableNotification>
  );
};

export default memo(FollowNotification);

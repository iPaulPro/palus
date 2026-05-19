import { UserPlusIcon } from "@heroicons/react/24/outline";
import type { FollowNotificationFragment } from "@palus/indexer";
import plur from "plur";
import { memo } from "react";
import { NotificationAccountAvatar } from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import getAccount from "@/helpers/getAccount";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { NotificationProps } from "@/types/palus";

const FollowNotification = ({
  notification,
  isNew
}: NotificationProps<FollowNotificationFragment>) => {
  const { currentAccount } = useAccountStore();
  const followers = notification.followers;
  const firstAccount = followers?.[0];
  const length = followers.length - 1;
  const moreThanOneAccount = length > 0;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} followed`
    : "followed";
  const type = "you";
  const timestamp = notification.followers[0].followedAt;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <UserPlusIcon className="size-6" />
          <div className="flex items-center gap-x-1">
            {followers.slice(0, 10).map((follower) => (
              <div className="not-first:-ml-2" key={follower.account.address}>
                <NotificationAccountAvatar account={follower.account} />
              </div>
            ))}
          </div>
        </div>
        <Timestamp isNew={isNew} timestamp={timestamp} />
      </div>
      <div className="ml-9">
        <AggregatedNotificationTitle
          firstAccount={firstAccount.account}
          linkToType={getAccount(currentAccount).link}
          text={text}
          type={type}
        />
      </div>
    </div>
  );
};

export default memo(FollowNotification);

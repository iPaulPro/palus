import { UserPlusIcon } from "@heroicons/react/24/outline";
import getAccount from "@palus/helpers/getAccount";
import type { FollowNotificationFragment } from "@palus/indexer";
import dayjs from "dayjs";
import plur from "plur";
import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface FollowNotificationProps {
  notification: FollowNotificationFragment;
}

const FollowNotification = ({ notification }: FollowNotificationProps) => {
  const { currentAccount } = useAccountStore();
  const followers = notification.followers;
  const firstAccount = followers?.[0];
  const length = followers.length - 1;
  const moreThanOneAccount = length > 1;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} followed`
    : "followed";
  const type = "you";
  const timestamp = notification.followers[0].followedAt;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserPlusIcon className="size-6" />
          <div className="flex items-center space-x-1">
            {followers.slice(0, 10).map((follower) => (
              <div className="not-first:-ml-2" key={follower.account.address}>
                <NotificationAccountAvatar account={follower.account} />
              </div>
            ))}
          </div>
        </div>
        <Tooltip
          content={dayjs(timestamp).format("MMM D, YYYY h:mm A")}
          placement="left"
        >
          <div className="pl-4 text-secondary text-sm">
            {formatRelativeOrAbsolute(timestamp)}
          </div>
        </Tooltip>
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

export default FollowNotification;

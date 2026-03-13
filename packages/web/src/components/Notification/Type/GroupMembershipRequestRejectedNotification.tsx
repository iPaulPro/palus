import { UserGroupIcon } from "@heroicons/react/24/outline";
import type { GroupMembershipRequestRejectedNotificationFragment } from "@palus/indexer";
import dayjs from "dayjs";
import { Link } from "react-router";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { Image, Tooltip } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import formatAddress from "@/helpers/formatAddress";
import getAvatar from "@/helpers/getAvatar";

interface Props {
  notification: GroupMembershipRequestRejectedNotificationFragment;
}

const GroupMembershipRequestRejectedNotification = ({
  notification
}: Props) => {
  const rejectedBy = notification.rejectedBy;
  const rejectedAt = notification.rejectedAt;
  const group = notification.group;

  const GroupAvatar = () => (
    <Image
      alt={group.address}
      className="size-7 rounded-full border border-gray-200 bg-gray-200 object-cover sm:size-8 dark:border-gray-800"
      height={32}
      src={getAvatar(group, TRANSFORMS.AVATAR_BIG)}
      width={32}
    />
  );

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="size-6" />
          <div className="flex items-center space-x-1">
            <Link to={`/g/${group.address}`}>
              <GroupAvatar />
            </Link>
          </div>
        </div>
        <Tooltip
          content={dayjs(rejectedAt).format("MMM D, YYYY h:mm A")}
          placement="left"
        >
          <div className="text-secondary text-sm">
            {formatRelativeOrAbsolute(rejectedAt)}
          </div>
        </Tooltip>
      </div>
      <div className="ml-9 flex flex-wrap items-center space-x-1">
        <AggregatedNotificationTitle
          firstAccount={rejectedBy}
          linkToType={`/g/${group.address}`}
          text="rejected your request to join"
        />
        <Link className="font-bold hover:underline" to={`/g/${group.address}`}>
          {group.metadata?.name
            ? `#${group.metadata?.name}`
            : formatAddress(group.address)}
        </Link>
      </div>
    </div>
  );
};

export default GroupMembershipRequestRejectedNotification;

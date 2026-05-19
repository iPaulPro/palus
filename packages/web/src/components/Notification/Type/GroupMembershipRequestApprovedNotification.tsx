import { UserGroupIcon } from "@heroicons/react/24/outline";
import type {
  GroupFragment,
  GroupMembershipRequestApprovedNotificationFragment
} from "@palus/indexer";
import { memo } from "react";
import { Link } from "react-router";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import GroupPreview from "@/components/Shared/Group/GroupPreview";
import { Image } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import formatAddress from "@/helpers/formatAddress";
import getAvatar from "@/helpers/getAvatar";
import type { NotificationProps } from "@/types/palus";

const GroupAvatar = ({ group }: { group: GroupFragment }) => (
  <Image
    alt={group.address}
    className="size-7 rounded-full border border-gray-200 bg-gray-200 object-cover sm:size-8 dark:border-gray-800"
    height={32}
    src={getAvatar(group, TRANSFORMS.AVATAR_BIG)}
    width={32}
  />
);

const GroupMembershipRequestApprovedNotification = ({
  notification,
  isNew
}: NotificationProps<GroupMembershipRequestApprovedNotificationFragment>) => {
  const approvedBy = notification.approvedBy;
  const approvedAt = notification.approvedAt;
  const group = notification.group;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="size-6" />
          <div className="flex items-center space-x-1">
            <Link to={`/g/${group.address}`}>
              <GroupAvatar group={group} />
            </Link>
          </div>
        </div>
        <Timestamp isNew={isNew} timestamp={approvedAt} />
      </div>
      <div className="ml-9 flex flex-wrap items-center space-x-1">
        <AggregatedNotificationTitle
          firstAccount={approvedBy}
          linkToType={`/g/${group.address}`}
          text="approved your request to join"
        />
        <Link className="font-bold hover:underline" to={`/g/${group.address}`}>
          <GroupPreview address={group.address} name={group.metadata?.name}>
            {group.metadata?.name
              ? `#${group.metadata?.name}`
              : formatAddress(group.address)}
          </GroupPreview>
        </Link>
      </div>
    </div>
  );
};

export default memo(GroupMembershipRequestApprovedNotification);

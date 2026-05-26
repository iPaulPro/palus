import { GiftIcon } from "@heroicons/react/24/outline";
import type { TokenDistributedNotificationFragment } from "@palus/indexer";
import { memo } from "react";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import type { NotificationProps } from "@/types/palus";

const TokenDistributedNotification = ({
  notification,
  isNew
}: NotificationProps<TokenDistributedNotificationFragment>) => {
  const amount = notification.amount;
  const timestamp = notification.actionDate;

  return (
    <div className="flex items-center justify-between px-4 py-5 md:p-5">
      <div className="flex items-center gap-x-3">
        <GiftIcon className="size-6" />
        <div>
          You have received {amount.value} {amount.asset.symbol}
        </div>
      </div>
      <Timestamp isNew={isNew} timestamp={timestamp} />
    </div>
  );
};

export default memo(TokenDistributedNotification);

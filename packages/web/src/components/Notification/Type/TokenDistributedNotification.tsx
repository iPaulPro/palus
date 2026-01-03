import { GiftIcon } from "@heroicons/react/24/outline";
import type { TokenDistributedNotificationFragment } from "@palus/indexer";
import dayjs from "dayjs";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";

interface TokenDistributedNotificationProps {
  notification: TokenDistributedNotificationFragment;
}

const TokenDistributedNotification = ({
  notification
}: TokenDistributedNotificationProps) => {
  const amount = notification.amount;
  const timestamp = notification.actionDate;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <GiftIcon className="size-6" />
        <div>
          You have received {amount.value} {amount.asset.symbol}
        </div>
      </div>
      <Tooltip
        content={dayjs(timestamp).format("MMM D, YYYY h:mm A")}
        placement="left"
      >
        <div className="text-secondary text-sm">
          {formatRelativeOrAbsolute(timestamp)}
        </div>
      </Tooltip>
    </div>
  );
};

export default TokenDistributedNotification;

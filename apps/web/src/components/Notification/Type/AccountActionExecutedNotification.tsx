import type {
  AccountActionExecutedNotificationFragment,
  TippingAccountActionExecuted
} from "@palus/indexer";
import dayjs from "dayjs";
import plur from "plur";
import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { TipIcon } from "@/components/Shared/Icons/TipIcon";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";

interface AccountActionExecutedNotificationProps {
  notification: AccountActionExecutedNotificationFragment;
}

function isTippingActionExecuted(
  action: any
): action is TippingAccountActionExecuted {
  return action?.__typename === "TippingAccountActionExecuted";
}

const AccountActionExecutedNotification = ({
  notification
}: AccountActionExecutedNotificationProps) => {
  const actions = notification.actions;
  const firstAction = actions[0];
  const firstAccount =
    firstAction.__typename === "TippingAccountActionExecuted"
      ? firstAction.executedBy
      : undefined;
  const length = actions.length - 1;
  const moreThanOneAccount = length > 1;
  const type =
    firstAction.__typename === "TippingAccountActionExecuted"
      ? "tipped"
      : undefined;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} ${type} you`
    : `${type} you`;

  const amount =
    firstAction && !moreThanOneAccount && isTippingActionExecuted(firstAction)
      ? firstAction.tipAmount
      : undefined;

  const timestamp = notification.actions[0].executedAt;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TipIcon className="size-6" />
          <div className="flex items-center space-x-1">
            {actions.slice(0, 10).map((action, index: number) => {
              const account =
                action.__typename === "TippingAccountActionExecuted"
                  ? action.executedBy
                  : undefined;

              if (!account) {
                return null;
              }

              return (
                <div className="not-first:-ml-2" key={index}>
                  <NotificationAccountAvatar account={account} />
                </div>
              );
            })}
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
      <div className="ml-9">
        {firstAccount && (
          <AggregatedNotificationTitle
            amount={amount}
            firstAccount={firstAccount}
            linkToType={`/accounts/${firstAccount.address}`}
            text={text}
          />
        )}
      </div>
    </div>
  );
};

export default AccountActionExecutedNotification;

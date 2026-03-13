import type {
  AccountActionExecutedNotificationFragment,
  TippingAccountActionExecuted
} from "@palus/indexer";
import dayjs from "dayjs";
import plur from "plur";
import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { TipIcon } from "@/components/Shared/Icons/TipIcon";
import { Button, Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";

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
  const moreThanOneAccount = length > 0;
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

  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setNotificationShare } = usePostStore();

  const handleShare = () => {
    const action = notification.actions[0];
    if (!amount) {
      return;
    }
    setNotificationShare({
      amount,
      executedBy: action.executedBy,
      timestamp: new Date(action.executedAt),
      type: "account-tip"
    });
    setShowNewPostModal(true);
  };

  if (!type) {
    return null;
  }

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
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
      {amount ? (
        <div className="flex justify-end">
          <Button
            data-umami-event="Notification Share"
            data-umami-event-type="account-tip"
            onClick={handleShare}
            outline
            size="sm"
          >
            Share
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default AccountActionExecutedNotification;

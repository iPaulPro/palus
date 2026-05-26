import type {
  AccountActionExecutedNotificationFragment,
  TippingAccountActionExecuted
} from "@palus/indexer";
import plur from "plur";
import { memo } from "react";
import {
  NotificationAccountAvatar,
  NotificationAccountName
} from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import ExpandableNotification from "@/components/Notification/Type/Shared/ExpandableNotification";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import { TipIcon } from "@/components/Shared/Icons/TipIcon";
import { Button } from "@/components/Shared/UI";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import type { NotificationProps } from "@/types/palus";

function isTippingActionExecuted(
  action: any
): action is TippingAccountActionExecuted {
  return action?.__typename === "TippingAccountActionExecuted";
}

const AccountActionExecutedNotification = ({
  notification,
  isNew,
  seenAtTimestamp
}: NotificationProps<AccountActionExecutedNotificationFragment>) => {
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

  const singleAmount =
    firstAction && !moreThanOneAccount && isTippingActionExecuted(firstAction)
      ? firstAction.tipAmount
      : undefined;

  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setNotificationShare } = usePostStore();

  const handleShare = (action: (typeof actions)[number]) => {
    if (!isTippingActionExecuted(action)) return;
    setNotificationShare({
      amount: action.tipAmount,
      executedBy: action.executedBy,
      timestamp: new Date(action.executedAt),
      type: "account-tip"
    });
    setShowNewPostModal(true);
  };

  if (!type) {
    return null;
  }

  const isSingle = actions.length === 1;

  const singlePreview =
    isSingle && singleAmount ? (
      <div className="flex justify-end pt-1">
        <Button
          data-umami-event="Notification Share"
          data-umami-event-type="account-tip"
          onClick={() => handleShare(firstAction)}
          outline
          size="sm"
        >
          Share
        </Button>
      </div>
    ) : undefined;

  return (
    <ExpandableNotification
      avatars={actions.slice(0, 10).map((action) => {
        const account =
          action.__typename === "TippingAccountActionExecuted"
            ? action.executedBy
            : undefined;

        if (!account) {
          return null;
        }

        return (
          <div
            className="not-first:-ml-2"
            key={`${account.address}-${action.executedAt}`}
          >
            <NotificationAccountAvatar account={account} />
          </div>
        );
      })}
      expandable={!isSingle}
      icon={<TipIcon className="size-6" />}
      isNew={isNew}
      preview={singlePreview}
      timestamp={isSingle ? firstAction.executedAt : undefined}
      title={
        firstAccount ? (
          <AggregatedNotificationTitle
            amount={singleAmount}
            firstAccount={firstAccount}
            linkToType={`/accounts/${firstAccount.address}`}
            text={text}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-y-4 sm:gap-y-3">
        {actions.map((action) => {
          const account =
            action.__typename === "TippingAccountActionExecuted"
              ? action.executedBy
              : undefined;

          if (!account) {
            return null;
          }

          const tipAmount = isTippingActionExecuted(action)
            ? action.tipAmount
            : undefined;

          return (
            <div
              className="flex items-center justify-between gap-x-2"
              key={`${account.address}-${action.executedAt}`}
            >
              <div className="flex min-w-0 items-center gap-x-2">
                <NotificationAccountAvatar account={account} />
                <div className="min-w-0">
                  <NotificationAccountName account={account} bold={false} />
                  {tipAmount && (
                    <p className="truncate text-secondary text-xs">
                      {tipAmount.value} {tipAmount.asset.symbol}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-2">
                {tipAmount && (
                  <Button
                    data-umami-event="Notification Share"
                    data-umami-event-type="account-tip"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(action);
                    }}
                    outline
                    size="sm"
                  >
                    Share
                  </Button>
                )}
                <Timestamp
                  isNew={action.executedAt > seenAtTimestamp}
                  timestamp={action.executedAt}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ExpandableNotification>
  );
};

export default memo(AccountActionExecutedNotification);

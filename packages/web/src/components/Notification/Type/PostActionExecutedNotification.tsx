import {
  BoltIcon,
  ChartBarIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import type {
  PostActionExecutedNotificationFragment,
  TippingPostActionExecuted
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
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import { Button } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import getPostData from "@/helpers/getPostData";
import truncateUrl from "@/helpers/truncateUrl";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import type { NotificationProps } from "@/types/palus";

function isTippingActionExecuted(
  action: any
): action is TippingPostActionExecuted {
  return action?.__typename === "TippingPostActionExecuted";
}

type PostAction = PostActionExecutedNotificationFragment["actions"][number];

function getActionLabel(action: PostAction): string {
  if (action.__typename === "SimpleCollectPostActionExecuted")
    return "collected";
  if (action.__typename === "TippingPostActionExecuted") return "tipped";
  if (
    action.__typename === "UnknownPostActionExecuted" &&
    action.action.address === CONTRACTS.pollVoteAction
  )
    return "voted on";
  return "acted on";
}

function getActionAmount(action: PostAction) {
  if (action.__typename === "SimpleCollectPostActionExecuted")
    return action.action.payToCollect?.price;
  if (action.__typename === "TippingPostActionExecuted")
    return action.tipAmount;
  return undefined;
}

const PostActionExecutedNotification = ({
  notification,
  isNew,
  seenAtTimestamp
}: NotificationProps<PostActionExecutedNotificationFragment>) => {
  const post = notification.post;
  const { metadata } = post;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const actions = notification.actions;
  const firstAction = actions[0];
  const firstAccount = firstAction.executedBy;
  const length = actions.length - 1;
  const moreThanOneAccount = length > 0;
  const actionType = getActionLabel(firstAction);

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} ${actionType} your`
    : `${actionType} your`;

  const type = notification.post.commentOn ? "comment" : "post";

  const tipAmount =
    firstAction && !moreThanOneAccount && isTippingActionExecuted(firstAction)
      ? firstAction.tipAmount
      : undefined;

  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setNotificationShare } = usePostStore();

  const handleShare = (action: PostAction) => {
    const actionAmount = getActionAmount(action);
    if (!actionAmount) return;
    setNotificationShare({
      amount: actionAmount,
      executedBy: action.executedBy,
      timestamp: new Date(action.executedAt),
      type: isTippingActionExecuted(action) ? "post-tip" : "collect"
    });
    setShowNewPostModal(true);
  };

  const icon =
    actionType === "collected" ? (
      <ShoppingBagIcon className="size-6" />
    ) : actionType === "tipped" ? (
      <TipIcon className="size-6" />
    ) : actionType === "voted on" ? (
      <ChartBarIcon className="size-6" />
    ) : (
      <BoltIcon className="size-6" />
    );

  const postContent = (
    <PostLink
      className="linkify mt-2 line-clamp-2 text-gray-500 dark:text-gray-200"
      post={post}
    >
      {filteredContent ? (
        <Markup mentions={post.mentions}>{filteredContent}</Markup>
      ) : postData?.asset ? (
        <span>{truncateUrl(postData.asset.uri, 30)}</span>
      ) : null}
    </PostLink>
  );

  const isSingle = actions.length === 1;
  const firstActionAmount = getActionAmount(firstAction);

  const singlePreview = isSingle ? (
    <>
      {postContent}
      {firstActionAmount && (
        <div className="flex justify-end pt-2">
          <Button
            data-umami-event="Notification Share"
            data-umami-event-type={
              firstAction.__typename === "SimpleCollectPostActionExecuted"
                ? "post-collected"
                : "post-tip"
            }
            onClick={() => handleShare(firstAction)}
            size="sm"
            variant="outline"
          >
            Share
          </Button>
        </div>
      )}
    </>
  ) : undefined;

  return (
    <ExpandableNotification
      avatars={actions.slice(0, 10).map((action) => {
        const account = action.executedBy;
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
      icon={icon}
      isNew={isNew}
      preview={isSingle ? singlePreview : postContent}
      timestamp={isSingle ? firstAction.executedAt : undefined}
      title={
        firstAccount ? (
          <AggregatedNotificationTitle
            amount={tipAmount}
            firstAccount={firstAccount}
            linkToType={`/posts/${notification.post.slug}`}
            text={text}
            type={type}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-y-4 sm:gap-y-3">
        {actions.map((action) => {
          const account = action.executedBy;
          if (!account) {
            return null;
          }
          const actionLabel = getActionLabel(action);
          const actionAmount = getActionAmount(action);
          return (
            <div
              className="flex items-center justify-between gap-x-2"
              key={`${account.address}-${action.executedAt}`}
            >
              <div className="flex min-w-0 items-center gap-x-2">
                <NotificationAccountAvatar account={account} />
                <div className="min-w-0">
                  <NotificationAccountName account={account} bold={false} />
                  {actionAmount ? (
                    <p className="truncate text-secondary text-xs">
                      {actionLabel}
                      {actionAmount
                        ? ` ${actionAmount.value} ${actionAmount.asset.symbol}`
                        : ""}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-3">
                {actionAmount && (
                  <Button
                    data-umami-event="Notification Share"
                    data-umami-event-type={
                      action.__typename === "SimpleCollectPostActionExecuted"
                        ? "post-collected"
                        : "post-tip"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(action);
                    }}
                    size="sm"
                    variant="outline"
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
        <PostLink
          className="pt-1 font-semibold text-brand-500 text-sm"
          post={notification.post}
        >
          View post
        </PostLink>
      </div>
    </ExpandableNotification>
  );
};

export default memo(PostActionExecutedNotification);

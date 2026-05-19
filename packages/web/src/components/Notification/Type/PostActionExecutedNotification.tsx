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
import { NotificationAccountAvatar } from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
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

const PostActionExecutedNotification = ({
  notification,
  isNew
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
  const actionType =
    firstAction?.__typename === "SimpleCollectPostActionExecuted"
      ? "collected"
      : firstAction.__typename === "TippingPostActionExecuted"
        ? "tipped"
        : firstAction.__typename === "UnknownPostActionExecuted" &&
            firstAction.action.address === CONTRACTS.pollVoteAction
          ? "voted on"
          : "acted on";

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} ${actionType} your`
    : `${actionType} your`;

  const type = notification.post.commentOn ? "comment" : "post";

  const tipAmount =
    firstAction && !moreThanOneAccount && isTippingActionExecuted(firstAction)
      ? firstAction.tipAmount
      : undefined;
  const anyAmount =
    firstAction.__typename === "SimpleCollectPostActionExecuted"
      ? firstAction.action.payToCollect?.price
      : firstAction.__typename === "TippingPostActionExecuted"
        ? firstAction.tipAmount
        : undefined;

  const timestamp = notification.actions[0].executedAt;

  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setNotificationShare } = usePostStore();

  const handleShare = () => {
    const action = notification.actions[0];
    if (!anyAmount) {
      return;
    }
    setNotificationShare({
      amount: anyAmount,
      executedBy: action.executedBy,
      timestamp: new Date(action.executedAt),
      type: tipAmount ? "post-tip" : "collect"
    });
    setShowNewPostModal(true);
  };

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          {actionType === "collected" && <ShoppingBagIcon className="size-6" />}
          {actionType === "tipped" && <TipIcon className="size-6" />}
          {actionType === "voted on" && <ChartBarIcon className="size-6" />}
          {actionType === "acted on" && <BoltIcon className="size-6" />}
          <div className="flex items-center gap-x-1">
            {actions.slice(0, 10).map((action) => {
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
          </div>
        </div>
        <Timestamp isNew={isNew} timestamp={timestamp} />
      </div>
      <div className="ml-9">
        {firstAccount && (
          <AggregatedNotificationTitle
            amount={tipAmount}
            firstAccount={firstAccount}
            linkToType={`/posts/${notification.post.slug}`}
            text={text}
            type={type}
          />
        )}
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
        {anyAmount ? (
          <div
            className={`flex justify-end ${filteredContent.length ? "pt-2" : ""}`}
          >
            <Button
              data-umami-event="Notification Share"
              data-umami-event-type={
                firstAction.__typename === "SimpleCollectPostActionExecuted"
                  ? "post-collected"
                  : "post-tip"
              }
              onClick={handleShare}
              outline
              size="sm"
            >
              Share
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default memo(PostActionExecutedNotification);

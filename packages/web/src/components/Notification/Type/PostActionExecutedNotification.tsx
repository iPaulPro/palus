import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type {
  PostActionExecutedNotificationFragment,
  TippingPostActionExecuted
} from "@palus/indexer";
import dayjs from "dayjs";
import plur from "plur";
import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { TipIcon } from "@/components/Shared/Icons/TipIcon";
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import getPostData from "@/helpers/getPostData";
import truncateUrl from "@/helpers/truncateUrl";

interface PostActionExecutedNotificationProps {
  notification: PostActionExecutedNotificationFragment;
}

function isTippingActionExecuted(
  action: any
): action is TippingPostActionExecuted {
  return action?.__typename === "TippingPostActionExecuted";
}

const PostActionExecutedNotification = ({
  notification
}: PostActionExecutedNotificationProps) => {
  const post = notification.post;
  const { metadata } = post;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const actions = notification.actions;
  const firstAction = actions[0];
  const firstAccount =
    firstAction?.__typename === "SimpleCollectPostActionExecuted" ||
    firstAction.__typename === "TippingPostActionExecuted"
      ? firstAction.executedBy
      : undefined;
  const length = actions.length - 1;
  const moreThanOneAccount = length > 1;
  const actionType =
    firstAction?.__typename === "SimpleCollectPostActionExecuted"
      ? "collected"
      : firstAction.__typename === "TippingPostActionExecuted"
        ? "tipped"
        : undefined;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} ${actionType} your`
    : `${actionType} your`;

  const type = notification.post.commentOn ? "comment" : "post";

  const amount =
    firstAction && !moreThanOneAccount && isTippingActionExecuted(firstAction)
      ? firstAction.tipAmount
      : undefined;

  const timestamp = notification.actions[0].executedAt;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {actionType === "collected" && <ShoppingBagIcon className="size-6" />}
          {actionType === "tipped" && <TipIcon className="size-6" />}
          <div className="flex items-center space-x-1">
            {actions.slice(0, 10).map((action, index: number) => {
              const account =
                action.__typename === "SimpleCollectPostActionExecuted" ||
                action.__typename === "TippingPostActionExecuted"
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
      </div>
    </div>
  );
};

export default PostActionExecutedNotification;

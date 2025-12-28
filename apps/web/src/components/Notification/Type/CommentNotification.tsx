import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import getPostData from "@palus/helpers/getPostData";
import type { CommentNotificationFragment } from "@palus/indexer";
import dayjs from "dayjs";
import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import truncateUrl from "@/helpers/truncateUrl";

interface CommentNotificationProps {
  notification: CommentNotificationFragment;
}

const CommentNotification = ({ notification }: CommentNotificationProps) => {
  const metadata = notification.comment.metadata;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const firstAccount = notification.comment.author;

  const text = "replied to your";
  const type = notification.comment.commentOn?.commentOn ? "comment" : "post";
  const timestamp = notification.comment.timestamp;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftIcon className="size-6" />
          <div className="flex items-center space-x-1">
            <NotificationAccountAvatar account={firstAccount} />
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
        <AggregatedNotificationTitle
          firstAccount={firstAccount}
          linkToType={`/posts/${notification.comment.slug}`}
          text={text}
          type={type}
        />
        <PostLink
          className="linkify mt-2 line-clamp-2 text-gray-500 dark:text-gray-200"
          post={notification.comment}
        >
          {filteredContent ? (
            <Markup mentions={notification.comment.mentions}>
              {filteredContent}
            </Markup>
          ) : postData?.asset ? (
            <span>{truncateUrl(postData.asset.uri, 30)}</span>
          ) : null}
        </PostLink>
      </div>
    </div>
  );
};

export default CommentNotification;

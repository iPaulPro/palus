import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import type { CommentNotificationFragment } from "@palus/indexer";
import { memo } from "react";
import { NotificationAccountAvatar } from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import getPostData from "@/helpers/getPostData";
import truncateUrl from "@/helpers/truncateUrl";
import type { NotificationProps } from "@/types/palus";

const CommentNotification = ({
  notification,
  isNew
}: NotificationProps<CommentNotificationFragment>) => {
  const metadata = notification.comment.metadata;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const firstAccount = notification.comment.author;

  const text = "replied to your";
  const type = notification.comment.commentOn?.commentOn ? "comment" : "post";
  const timestamp = notification.comment.timestamp;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <ChatBubbleLeftIcon className="size-6" />
          <div className="flex items-center gap-x-1">
            <NotificationAccountAvatar account={firstAccount} />
          </div>
        </div>
        <Timestamp isNew={isNew} timestamp={timestamp} />
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

export default memo(CommentNotification);

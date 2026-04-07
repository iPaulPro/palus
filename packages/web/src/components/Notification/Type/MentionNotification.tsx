import { AtSymbolIcon } from "@heroicons/react/24/outline";
import type { MentionNotificationFragment } from "@palus/indexer";
import { memo } from "react";
import { NotificationAccountAvatar } from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import getPostData from "@/helpers/getPostData";
import type { NotificationProps } from "@/types/palus";

const MentionNotification = ({
  notification,
  isNew
}: NotificationProps<MentionNotificationFragment>) => {
  const metadata = notification.post.metadata;
  const filteredContent = getPostData(metadata)?.content || "";
  const firstAccount = notification.post.author;

  const text = "mentioned you in a";
  const type = notification.post.commentOn ? "comment" : "post";
  const timestamp = notification.post.timestamp;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AtSymbolIcon className="size-6" />
          <div className="flex items-center space-x-1">
            <NotificationAccountAvatar account={firstAccount} />
          </div>
        </div>
        <Timestamp isNew={isNew} timestamp={timestamp} />
      </div>
      <div className="ml-9">
        <AggregatedNotificationTitle
          firstAccount={firstAccount}
          linkToType={`/posts/${notification.post.slug}`}
          text={text}
          type={type}
        />
        <PostLink
          className="linkify mt-2 line-clamp-2 text-gray-500 dark:text-gray-200"
          post={notification.post}
        >
          <Markup mentions={notification.post.mentions}>
            {filteredContent}
          </Markup>
        </PostLink>
      </div>
    </div>
  );
};

export default memo(MentionNotification);

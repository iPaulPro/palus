import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import type { QuoteNotificationFragment } from "@palus/indexer";
import dayjs from "dayjs";
import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import getPostData from "@/helpers/getPostData";
import truncateUrl from "@/helpers/truncateUrl";

interface QuoteNotificationProps {
  notification: QuoteNotificationFragment;
}

const QuoteNotification = ({ notification }: QuoteNotificationProps) => {
  const metadata = notification.quote.metadata;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const firstAccount = notification.quote.author;

  const text = "quoted your";
  const type = notification.quote.quoteOf?.commentOn ? "comment" : "post";
  const timestamp = notification.quote.timestamp;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChatBubbleBottomCenterTextIcon className="size-6" />
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
          linkToType={`/posts/${notification.quote.slug}`}
          text={text}
          type={type}
        />
        <PostLink
          className="linkify mt-2 line-clamp-2 text-gray-500 dark:text-gray-200"
          post={notification.quote}
        >
          {filteredContent ? (
            <Markup mentions={notification.quote.mentions}>
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

export default QuoteNotification;

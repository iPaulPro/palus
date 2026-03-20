import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import type { RepostNotificationFragment } from "@palus/indexer";
import plur from "plur";
import { memo } from "react";
import { NotificationAccountAvatar } from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import Timestamp from "@/components/Notification/Type/Shared/Timestamp";
import Markup from "@/components/Shared/Markup";
import PostLink from "@/components/Shared/Post/PostLink";
import getPostData from "@/helpers/getPostData";
import truncateUrl from "@/helpers/truncateUrl";
import type { NotificationProps } from "@/types/palus";

const RepostNotification = ({
  notification,
  isNew
}: NotificationProps<RepostNotificationFragment>) => {
  const metadata = notification.post.metadata;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const reposts = notification.reposts;
  const firstAccount = reposts?.[0]?.account;
  const length = reposts.length - 1;
  const moreThanOneAccount = length > 0;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} reposted your`
    : "reposted your";
  const type = notification.post.commentOn ? "comment" : "post";
  const timestamp = notification.reposts[0].repostedAt;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ArrowsRightLeftIcon className="size-6" />
          <div className="flex items-center space-x-1">
            {reposts.slice(0, 10).map((repost) => (
              <div className="not-first:-ml-2" key={repost.account.address}>
                <NotificationAccountAvatar account={repost.account} />
              </div>
            ))}
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
          {filteredContent ? (
            <Markup mentions={notification.post.mentions}>
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

export default memo(RepostNotification);

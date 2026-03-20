import { HeartIcon } from "@heroicons/react/24/outline";
import type { ReactionNotificationFragment } from "@palus/indexer";
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

const ReactionNotification = ({
  notification,
  isNew
}: NotificationProps<ReactionNotificationFragment>) => {
  const metadata = notification.post.metadata;
  const postData = getPostData(metadata);
  const filteredContent = postData?.content || "";
  const reactions = notification.reactions;
  const firstAccount = reactions?.[0]?.account;
  const length = reactions.length - 1;
  const moreThanOneAccount = length > 0;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} liked your`
    : "liked your";
  const type = notification.post.commentOn ? "comment" : "post";
  const timestamp = notification.reactions[0].reactions[0].reactedAt;

  return (
    <div className="space-y-2 px-4 py-5 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HeartIcon className="size-6" />
          <div className="flex items-center space-x-1">
            {reactions.slice(0, 10).map((reaction) => (
              <div className="not-first:-ml-2" key={reaction.account.address}>
                <NotificationAccountAvatar account={reaction.account} />
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

export default memo(ReactionNotification);

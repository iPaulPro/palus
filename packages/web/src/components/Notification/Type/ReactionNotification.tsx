import { HeartIcon } from "@heroicons/react/24/outline";
import type { ReactionNotificationFragment } from "@palus/indexer";
import plur from "plur";
import { memo } from "react";
import {
  NotificationAccountAvatar,
  NotificationAccountName
} from "@/components/Notification/Type/Shared/Account";
import AggregatedNotificationTitle from "@/components/Notification/Type/Shared/AggregatedNotificationTitle";
import ExpandableNotification from "@/components/Notification/Type/Shared/ExpandableNotification";
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
  const isSingle = reactions.length === 1;

  return (
    <ExpandableNotification
      avatars={reactions.slice(0, 10).map((reaction) => (
        <div className="not-first:-ml-2" key={reaction.account.address}>
          <NotificationAccountAvatar account={reaction.account} />
        </div>
      ))}
      expandable={!isSingle}
      icon={<HeartIcon className="size-6" />}
      isNew={isNew}
      preview={
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
      }
      timestamp={isSingle ? reactions[0].reactions[0].reactedAt : undefined}
      title={
        <AggregatedNotificationTitle
          firstAccount={firstAccount}
          linkToType={`/posts/${notification.post.slug}`}
          text={text}
          type={type}
        />
      }
    >
      {reactions.map((reaction) =>
        reaction.reactions.map((r) => (
          <div
            className="flex items-center justify-between"
            key={`${reaction.account.address}-${r.reactedAt}`}
          >
            <div className="flex items-center gap-x-2">
              <NotificationAccountAvatar account={reaction.account} />
              <NotificationAccountName
                account={reaction.account}
                bold={false}
              />
            </div>
            <Timestamp
              isNew={false}
              timestamp={reaction.reactions[0].reactedAt}
            />
          </div>
        ))
      )}
    </ExpandableNotification>
  );
};

export default memo(ReactionNotification);

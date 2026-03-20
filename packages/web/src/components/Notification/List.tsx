import { BellIcon } from "@heroicons/react/24/outline";
import {
  type NotificationRequest,
  NotificationType,
  useNotificationsQuery
} from "@palus/indexer";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import type { WindowVirtualizerHandle } from "virtua";
import AccountActionExecutedNotification from "@/components/Notification/Type/AccountActionExecutedNotification";
import CommentNotification from "@/components/Notification/Type/CommentNotification";
import FollowNotification from "@/components/Notification/Type/FollowNotification";
import MentionNotification from "@/components/Notification/Type/MentionNotification";
import PostActionExecutedNotification from "@/components/Notification/Type/PostActionExecutedNotification";
import QuoteNotification from "@/components/Notification/Type/QuoteNotification";
import ReactionNotification from "@/components/Notification/Type/ReactionNotification";
import RepostNotification from "@/components/Notification/Type/RepostNotification";
import CachedWindowVirtualizer from "@/components/Shared/CachedWindowVirtualizer";
import PullToRefresh from "@/components/Shared/PullToRefresh";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import { NotificationFeedType } from "@/data/enums";
import { getNotificationTimestamp } from "@/helpers/getNotificationTimestamp";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";
import NotificationShimmer from "./Shimmer";
import GroupMembershipRequestApprovedNotification from "./Type/GroupMembershipRequestApprovedNotification";
import GroupMembershipRequestRejectedNotification from "./Type/GroupMembershipRequestRejectedNotification";
import TokenDistributedNotification from "./Type/TokenDistributedNotification";

const notificationComponentMap = {
  AccountActionExecutedNotification,
  CommentNotification,
  FollowNotification,
  GroupMembershipRequestApprovedNotification,
  GroupMembershipRequestRejectedNotification,
  MentionNotification,
  PostActionExecutedNotification,
  QuoteNotification,
  ReactionNotification,
  RepostNotification,
  TokenDistributedNotification
};

interface ListProps {
  feedType: string;
}

const List = ({ feedType }: ListProps) => {
  const {
    lastSeenNotificationTimestamp,
    notificationRefreshSignal,
    setLastSeenNotificationTimestamp
  } = useNotificationStore();
  const { includeLowScore } = usePreferencesStore();
  const { bannedAccounts } = useBannedAccountsStore();

  const seenAtMountRef = useRef(lastSeenNotificationTimestamp);

  useEffect(() => {
    seenAtMountRef.current = lastSeenNotificationTimestamp;
  }, [notificationRefreshSignal]);

  const getNotificationType = (feedType: string) => {
    switch (feedType) {
      case NotificationFeedType.All:
        return;
      case NotificationFeedType.Mentions:
        return [NotificationType.Mentioned];
      case NotificationFeedType.Comments:
        return [NotificationType.Commented];
      case NotificationFeedType.Likes:
        return [NotificationType.Reacted];
      case NotificationFeedType.Actions:
        return [
          NotificationType.ExecutedPostAction,
          NotificationType.ExecutedAccountAction
        ];
      case NotificationFeedType.Rewards:
        return [NotificationType.TokenDistributed];
      default:
        return;
    }
  };

  const request: NotificationRequest = useMemo(
    () => ({
      filter: {
        includeLowScore,
        notificationTypes: getNotificationType(feedType)
      }
    }),
    [includeLowScore, feedType]
  );

  const { data, error, fetchMore, loading, refetch } = useNotificationsQuery({
    variables: { request }
  });

  const notifications = data?.notifications?.items;
  const pageInfo = data?.notifications?.pageInfo;
  const hasMore = !!pageInfo?.next;

  const cacheKey = "window-list-cache-notifications";
  const ref = useRef<WindowVirtualizerHandle>(null);

  const getNotificationActorAddress = (
    notification: NonNullable<typeof notifications>[number]
  ): string | undefined => {
    switch (notification?.__typename) {
      case "AccountActionExecutedNotification":
      case "PostActionExecutedNotification":
        return notification.actions.length === 1
          ? notification.actions[0].executedBy.address
          : undefined;
      case "CommentNotification":
        return notification.comment.author.address;
      case "FollowNotification":
        return notification.followers.length === 1
          ? notification.followers[0].account.address
          : undefined;
      case "MentionNotification":
        return notification.post.author.address;
      case "QuoteNotification":
        return notification.quote.author.address;
      case "ReactionNotification":
        return notification.reactions.length === 1
          ? notification.reactions[0].account.address
          : undefined;
      case "RepostNotification":
        return notification.reposts.length === 1
          ? notification.reposts[0].account.address
          : undefined;
      default:
        return undefined;
    }
  };

  const filteredNotifications = useMemo(
    () =>
      notifications?.filter((notification) => {
        const actorAddress = getNotificationActorAddress(notification);
        return actorAddress ? !bannedAccounts.includes(actorAddress) : true;
      }),
    [notifications, bannedAccounts]
  );

  useEffect(() => {
    const firstNotification = notifications?.[0];
    if (
      !firstNotification ||
      typeof firstNotification !== "object" ||
      !("id" in firstNotification)
    ) {
      return;
    }
    const timestamp = getNotificationTimestamp(firstNotification);
    if (timestamp) {
      setLastSeenNotificationTimestamp(timestamp);
    }
  }, [notifications]);

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  const handleRefresh = useCallback(async () => {
    seenAtMountRef.current = lastSeenNotificationTimestamp;
    await refetch();
  }, [lastSeenNotificationTimestamp, refetch]);

  if (loading) {
    return (
      <Card className="divide-y divide-gray-200 dark:divide-gray-800">
        <NotificationShimmer />
        <NotificationShimmer />
        <NotificationShimmer />
        <NotificationShimmer />
      </Card>
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load notifications" />;
  }

  if (!filteredNotifications?.length) {
    return (
      <EmptyState
        icon={<BellIcon className="size-8" />}
        message="Inbox zero!"
      />
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Card className="virtual-divider-list-window">
        <CachedWindowVirtualizer cacheKey={cacheKey} ref={ref}>
          {filteredNotifications.map((notification) => {
            if (!("id" in notification)) {
              return null;
            }

            const Component =
              notificationComponentMap[
                notification.__typename as keyof typeof notificationComponentMap
              ];

            const timestamp = getNotificationTimestamp(notification);

            return Component ? (
              <Component
                isNew={new Date(timestamp) > new Date(seenAtMountRef.current)}
                key={notification.id}
                notification={notification as never}
              />
            ) : null;
          })}
          {hasMore && <div className="h-0.5" ref={loadMoreRef} />}
        </CachedWindowVirtualizer>
      </Card>
    </PullToRefresh>
  );
};

export default memo(List);

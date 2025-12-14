import { BellIcon } from "@heroicons/react/24/outline";
import { NotificationFeedType } from "@palus/data/enums";
import {
  type NotificationRequest,
  NotificationType,
  useNotificationsQuery
} from "@palus/indexer";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from "react";
import {
  type CacheSnapshot,
  WindowVirtualizer,
  type WindowVirtualizerHandle
} from "virtua";
import AccountActionExecutedNotification from "@/components/Notification/Type/AccountActionExecutedNotification";
import CommentNotification from "@/components/Notification/Type/CommentNotification";
import FollowNotification from "@/components/Notification/Type/FollowNotification";
import MentionNotification from "@/components/Notification/Type/MentionNotification";
import PostActionExecutedNotification from "@/components/Notification/Type/PostActionExecutedNotification";
import QuoteNotification from "@/components/Notification/Type/QuoteNotification";
import ReactionNotification from "@/components/Notification/Type/ReactionNotification";
import RepostNotification from "@/components/Notification/Type/RepostNotification";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import NotificationShimmer from "./Shimmer";
import TokenDistributedNotification from "./Type/TokenDistributedNotification";

const notificationComponentMap = {
  AccountActionExecutedNotification,
  CommentNotification,
  FollowNotification,
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
  const { setLastSeenNotificationId } = useNotificationStore();

  const getNotificationType = useCallback(() => {
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
  }, [feedType]);

  const request: NotificationRequest = {
    filter: {
      includeLowScore: false,
      notificationTypes: getNotificationType()
    }
  };

  const { data, error, fetchMore, loading } = useNotificationsQuery({
    variables: { request }
  });

  const notifications = data?.notifications?.items;
  const pageInfo = data?.notifications?.pageInfo;
  const hasMore = !!pageInfo?.next;

  const cacheKey = "window-list-cache-notifications";
  const ref = useRef<WindowVirtualizerHandle>(null);

  const [offset, cache] = useMemo(() => {
    const serialized = sessionStorage.getItem(cacheKey);
    if (!serialized) return [];
    try {
      return JSON.parse(serialized) as [number, CacheSnapshot];
    } catch {
      return [];
    }
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const handle = ref.current;

    window.scrollTo(0, offset ?? 0);

    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      // Use stored window.scrollY because it may return 0 in useEffect cleanup
      sessionStorage.setItem(cacheKey, JSON.stringify([scrollY, handle.cache]));
    };
  }, []);

  useEffect(() => {
    const firstNotification = notifications?.[0];
    if (
      !firstNotification ||
      typeof firstNotification !== "object" ||
      !("id" in firstNotification)
    ) {
      return;
    }
    const firstId = firstNotification.id;
    if (firstId) {
      setLastSeenNotificationId(firstId);
    }
  }, [notifications, setLastSeenNotificationId]);

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  if (loading) {
    return (
      <Card className="divide-y divide-gray-200 dark:divide-gray-700">
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

  if (!notifications?.length) {
    return (
      <EmptyState
        icon={<BellIcon className="size-8" />}
        message="Inbox zero!"
      />
    );
  }

  return (
    <Card className="virtual-divider-list-window">
      <WindowVirtualizer cache={cache} ref={ref}>
        {notifications.map((notification) => {
          if (!("id" in notification)) {
            return null;
          }

          const Component =
            notificationComponentMap[
              notification.__typename as keyof typeof notificationComponentMap
            ];

          return (
            <div
              className={cn({
                "p-5": notification.__typename !== "FollowNotification"
              })}
              key={notification.id}
            >
              {Component && <Component notification={notification as never} />}
            </div>
          );
        })}
        {hasMore && <span ref={loadMoreRef} />}
      </WindowVirtualizer>
    </Card>
  );
};

export default memo(List);

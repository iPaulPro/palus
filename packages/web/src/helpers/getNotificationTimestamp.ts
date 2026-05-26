import type { AnyNotificationFragment } from "@/types/palus";

export const getNotificationTimestamp = (
  notification: AnyNotificationFragment,
  index = 0
): string => {
  switch (notification.__typename) {
    case "AccountActionExecutedNotification":
    case "PostActionExecutedNotification":
      return notification.actions[index].executedAt;
    case "CommentNotification":
      return notification.comment.timestamp;
    case "FollowNotification":
      return notification.followers[index].followedAt;
    case "GroupMembershipRequestApprovedNotification":
      return notification.approvedAt;
    case "GroupMembershipRequestRejectedNotification":
      return notification.rejectedAt;
    case "MentionNotification":
      return notification.post.timestamp;
    case "QuoteNotification":
      return notification.quote.timestamp;
    case "ReactionNotification":
      return notification.reactions[index].reactions[0].reactedAt;
    case "RepostNotification":
      return notification.reposts[index].repostedAt;
    case "TokenDistributedNotification":
      return notification.actionDate;
  }
};

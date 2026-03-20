import type { AnyNotificationFragment } from "@/types/palus";

export const getNotificationTimestamp = (
  notification: AnyNotificationFragment
) => {
  switch (notification?.__typename) {
    case "AccountActionExecutedNotification":
    case "PostActionExecutedNotification":
      return notification.actions[0].executedAt;
    case "CommentNotification":
      return notification.comment.timestamp;
    case "FollowNotification":
      return notification.followers[0].followedAt;
    case "GroupMembershipRequestApprovedNotification":
      return notification.approvedAt;
    case "GroupMembershipRequestRejectedNotification":
      return notification.rejectedAt;
    case "MentionNotification":
      return notification.post.timestamp;
    case "QuoteNotification":
      return notification.quote.timestamp;
    case "ReactionNotification":
      return notification.reactions[0].reactions[0].reactedAt;
    case "RepostNotification":
      return notification.reposts[0].repostedAt;
    case "TokenDistributedNotification":
      return notification.actionDate;
    default:
      return undefined;
  }
};

import type {
  AccountActionExecutedNotificationFragment,
  AccountFragment,
  CommentNotificationFragment,
  Erc20AmountFragment,
  FollowNotificationFragment,
  GroupMembershipRequestApprovedNotificationFragment,
  GroupMembershipRequestRejectedNotificationFragment,
  MentionNotificationFragment,
  NativeAmountFragment,
  PayToCollectInput,
  PostActionExecutedNotificationFragment,
  QuoteNotificationFragment,
  ReactionNotificationFragment,
  RepostNotificationFragment,
  TokenDistributedNotificationFragment
} from "@palus/indexer";

export type CollectActionType = {
  enabled?: boolean;
  payToCollect?: PayToCollectInput;
  collectLimit?: null | number;
  followerOnly?: boolean;
  endsAt?: null | string;
};

type PollOption = {
  id: number;
  text: string;
  voteCount: number;
  voted: boolean;
};

export type Poll = {
  id: number;
  endsAt: Date;
  options: PollOption[];
  allowMultipleAnswers: boolean;
};

export interface PollConfig {
  durationInDays: number | undefined;
  options: string[];
  allowMultipleAnswers: boolean;
}

export type ShareAction = {
  type: "collect" | "post-tip" | "account-tip";
  executedBy: AccountFragment;
  amount: Erc20AmountFragment | NativeAmountFragment;
  timestamp: Date;
};

export interface NotificationProps<T> {
  notification: T;
  isNew: boolean;
  seenAtTimestamp: string;
}

export type AnyNotificationFragment =
  | AccountActionExecutedNotificationFragment
  | CommentNotificationFragment
  | FollowNotificationFragment
  | GroupMembershipRequestApprovedNotificationFragment
  | GroupMembershipRequestRejectedNotificationFragment
  | MentionNotificationFragment
  | PostActionExecutedNotificationFragment
  | QuoteNotificationFragment
  | ReactionNotificationFragment
  | RepostNotificationFragment
  | TokenDistributedNotificationFragment;

export interface Transaction {
  timeStamp?: string;
  receivedAt?: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError?: string;
  error?: string;
  type: string;
  blockNumber: string;
  input?: string;
  data?: string;
  confirmations?: string;
  internal?: Transaction;
}

export interface TransactionsResponse {
  status: string;
  message: string;
  result: Transaction[];
}

export interface ActivityProps {
  account: string;
}

export interface BlockRange {
  endBlock: number;
  startBlock: number;
  startBlockTimestamp: number;
}

import type { PayToCollectInput } from "@palus/indexer";

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
};

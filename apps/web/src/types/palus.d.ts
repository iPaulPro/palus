import type { PayToCollectInput } from "@palus/indexer";

export type CollectActionType = {
  enabled?: boolean;
  payToCollect?: PayToCollectInput;
  collectLimit?: null | number;
  followerOnly?: boolean;
  endsAt?: null | string;
};

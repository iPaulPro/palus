import type { PostActionConfigInput } from "@palus/indexer";
import { PLATFORM_COLLECT_FEE } from "@/data/constants";
import type { CollectActionType } from "@/types/palus";

const collectActionParams = (
  collectAction: CollectActionType
): PostActionConfigInput | null => {
  const { payToCollect, collectLimit, endsAt } = collectAction;

  return {
    simpleCollect: {
      collectLimit,
      endsAt,
      payToCollect: payToCollect
        ? {
            ...payToCollect,
            referralShare:
              Number(payToCollect.referralShare ?? 0) + PLATFORM_COLLECT_FEE
          }
        : undefined
    }
  };
};

export default collectActionParams;

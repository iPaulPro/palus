import type { PostActionConfigInput } from "@palus/indexer";
import type { CollectActionType } from "@/types/palus";

const collectActionParams = (
  collectAction: CollectActionType
): PostActionConfigInput | null => {
  const { payToCollect, collectLimit, endsAt } = collectAction;

  return {
    simpleCollect: { collectLimit, endsAt, payToCollect }
  };
};

export default collectActionParams;

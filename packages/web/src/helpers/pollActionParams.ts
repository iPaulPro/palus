import type { UnknownActionConfigInput } from "@palus/indexer";
import dayjs from "dayjs";
import { CONTRACTS } from "@/data/contracts";
import { toKeyValueInput } from "@/helpers/keyValueInput";
import { DEFAULT_DURATION_DAYS } from "@/store/non-persisted/post/usePostPollStore";
import type { PollConfig } from "@/types/palus";

const pollActionParams = (pollConfig: PollConfig) => {
  return {
    unknown: {
      address: CONTRACTS.pollVoteAction,
      params: [
        toKeyValueInput("lens.param.options", "string[]", pollConfig.options),
        toKeyValueInput(
          "lens.param.endTimestamp",
          "uint72",
          BigInt(
            dayjs()
              .add(pollConfig.durationInDays ?? DEFAULT_DURATION_DAYS, "day")
              .unix()
          )
        ),
        toKeyValueInput(
          "lens.param.allowMultipleAnswers",
          "bool",
          pollConfig.allowMultipleAnswers
        )
      ]
    } satisfies UnknownActionConfigInput
  };
};

export default pollActionParams;

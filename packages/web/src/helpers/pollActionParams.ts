import type { UnknownActionConfigInput } from "@palus/indexer";
import dayjs from "dayjs";
import { CONTRACTS } from "@/data/contracts";
import { toKeyValueInput } from "@/helpers/keyValueInput";
import type { PollConfig } from "@/store/non-persisted/post/usePostPollStore";

const pollActionParams = (pollConfig: PollConfig) => {
  return {
    unknown: {
      address: CONTRACTS.pollVoteAction,
      params: [
        toKeyValueInput("lens.param.options", "string[]", pollConfig.options),
        toKeyValueInput(
          "lens.param.endTimestamp",
          "uint72",
          BigInt(dayjs().add(pollConfig.durationInDays, "day").unix())
        ),
        toKeyValueInput("lens.param.allowMultipleAnswers", "bool", false)
      ]
    } satisfies UnknownActionConfigInput
  };
};

export default pollActionParams;

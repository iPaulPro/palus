import { TrophyIcon } from "@heroicons/react/24/outline";
import {
  Bars3BottomLeftIcon,
  CheckCircleIcon
} from "@heroicons/react/24/solid";
import { useExecutePostActionMutation } from "@palus/indexer";
import dayjs from "dayjs";
import plur from "plur";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { encodeAbiParameters, keccak256, stringToBytes } from "viem";
import { Card, Spinner, Tooltip } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import cn from "@/helpers/cn";
import getTimetoNow from "@/helpers/datetime/getTimetoNow";
import errorToast from "@/helpers/errorToast";
import humanize from "@/helpers/humanize";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import type { ApolloClientError } from "@/types/errors";
import type { Poll } from "@/types/palus";

interface ChoicesProps {
  poll: Poll;
  onVoteSuccess?: () => void;
}

const Choices = ({ poll }: ChoicesProps) => {
  const { options, endsAt } = poll;
  const totalVoteCount = options.reduce((acc, { voteCount }) => {
    return acc + voteCount;
  }, 0);
  const isPollLive = new Date(endsAt) > new Date();
  const highestVoteCount = Math.max(
    ...options.map((option) => option.voteCount)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<null | number>(null);
  const [hasVoted, setHasVoted] = useState(
    options.some((option) => option.voted)
  );

  const handleTransactionLifecycle = useTransactionLifecycle();

  const onCompleted = () => {
    setHasVoted(true);
    setIsSubmitting(false);
    toast.success("Voted successfully");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [executePostAction] = useExecutePostActionMutation({
    onCompleted: async ({ executePostAction }) => {
      if (executePostAction.__typename === "ExecutePostActionResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: executePostAction
      });
    },
    onError
  });

  const handleVote = async (optionId: number) => {
    setIsSubmitting(true);
    setSelectedOption(optionId);

    return await executePostAction({
      variables: {
        request: {
          action: {
            unknown: {
              address: CONTRACTS.pollVoteAction,
              params: [
                {
                  data: encodeAbiParameters(
                    [{ name: "options", type: "uint8[]" }],
                    [[optionId]]
                  ),
                  key: keccak256(stringToBytes("lens.param.voteOptions"))
                }
              ]
            }
          },
          post: poll.id
        }
      }
    });
  };

  return (
    <Card forceRounded onClick={stopEventPropagation}>
      <div className="space-y-2 p-2">
        {options.map((option, index) => (
          <button
            className={cn(
              "flex w-full items-center space-x-2.5 rounded-xl p-2 text-left text-sm enabled:hover:bg-gray-100 dark:enabled:hover:bg-gray-800",
              {
                "border border-gray-300 dark:border-gray-700":
                  !isPollLive && option.voteCount === highestVoteCount
              }
            )}
            disabled={isSubmitting || !isPollLive || hasVoted}
            key={index}
            onClick={() => handleVote(option.id)}
            type="button"
          >
            {isSubmitting && option.id === selectedOption ? (
              <Spinner className="mr-1" size="sm" />
            ) : (
              <CheckCircleIcon
                className={cn(
                  option.voted || option.id === selectedOption
                    ? "text-brand-400"
                    : "text-secondary",
                  "size-6"
                )}
              />
            )}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between gap-x-2">
                <div className="font-bold">{option.text}</div>
                <div className="flex items-center gap-x-1">
                  {!isPollLive && option.voteCount === highestVoteCount ? (
                    <TrophyIcon className="size-4 text-secondary" />
                  ) : null}
                  <Tooltip content={option.voteCount}>
                    <span className="text-secondary">
                      {((option.voteCount / totalVoteCount) * 100).toFixed(0)}%
                    </span>
                  </Tooltip>
                </div>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
                <div
                  className="bg-brand-400"
                  style={{
                    width: `${(option.voteCount / totalVoteCount) * 100}%`
                  }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between border-border border-t px-5 py-3">
        <div className="flex items-center space-x-2 text-secondary text-xs">
          <Bars3BottomLeftIcon className="size-4" />
          <span>
            {humanize(totalVoteCount || 0)} {plur("vote", totalVoteCount || 0)}
          </span>
          <span>·</span>
          <Tooltip content={dayjs(endsAt).format("MMM D, YYYY, h:mm A")}>
            {isPollLive ? (
              <span>{getTimetoNow(new Date(endsAt))} left</span>
            ) : (
              <span>Poll ended</span>
            )}
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default Choices;

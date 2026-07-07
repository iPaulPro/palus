import {
  Bars3BottomLeftIcon,
  CheckCircleIcon,
  TrophyIcon
} from "@heroicons/react/24/solid";
import {
  type PostFragment,
  useExecutePostActionMutation
} from "@palus/indexer";
import dayjs from "dayjs";
import plur from "plur";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { encodeAbiParameters, keccak256, stringToBytes } from "viem";
import {
  Button,
  Card,
  HelpTooltip,
  Modal,
  Spinner,
  Tooltip
} from "@/components/Shared/UI";
import { ScrollArea } from "@/components/Shared/UI/ScrollArea";
import { CONTRACTS } from "@/data/contracts";
import cn from "@/helpers/cn";
import getTimetoNow from "@/helpers/datetime/getTimetoNow";
import errorToast from "@/helpers/errorToast";
import humanize from "@/helpers/humanize";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";
import type { Poll } from "@/types/palus";
import Voters from "./Voters";

interface ChoicesProps {
  poll: Poll;
  post: PostFragment;
  onVoteSuccess?: (choices: number[]) => void;
}

const Choices = ({ poll, post, onVoteSuccess }: ChoicesProps) => {
  const { endsAt, options, allowMultipleAnswers } = poll;
  const [showPostExecutorsModal, setShowPostExecutorsModal] = useState(false);

  const totalVoteCount = options.reduce((acc, { voteCount }) => {
    return acc + voteCount;
  }, 0);
  const isPollLive = new Date(endsAt) > new Date();
  const highestVoteCount = Math.max(
    ...options.map((option) => option.voteCount)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<null | number[]>(null);
  const [hasVoted, setHasVoted] = useState(() =>
    options.some((option) => option.voted)
  );

  const { currentAccount } = useAccountStore();
  const handleTransactionLifecycle = useTransactionLifecycle();

  const onCompleted = () => {
    setHasVoted(true);
    setIsSubmitting(false);
    if (selectedOptions !== null) {
      onVoteSuccess?.(selectedOptions);
    }
    toast.success("Voted successfully!");
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

  const handleVote = async () => {
    if (!selectedOptions || selectedOptions.length === 0) {
      return;
    }

    setIsSubmitting(true);

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
                    [selectedOptions]
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
    <>
      <Card className="sm:w-4/5" forceRounded onClick={stopEventPropagation}>
        <ScrollArea className="max-h-72 overflow-y-auto p-2">
          {options.map((option) => {
            const isSelected = selectedOptions?.includes(option.id);
            const isWinner =
              !isPollLive && option.voteCount === highestVoteCount;

            return (
              <button
                className={cn(
                  "not-last:mb-2.5 flex w-full items-center gap-x-2.5 rounded-xl p-2 text-left text-sm enabled:hover:bg-gray-100 dark:enabled:hover:bg-gray-800",
                  {
                    "bg-gray-100 dark:bg-gray-800": isSelected && !hasVoted,
                    "border border-gray-400 dark:border-gray-600": isWinner
                  }
                )}
                disabled={isSubmitting || !isPollLive || hasVoted}
                key={option.id}
                onClick={() =>
                  setSelectedOptions((selected) => {
                    if (selected?.includes(option.id)) {
                      return selected.filter((id) => id !== option.id);
                    }
                    if (allowMultipleAnswers) {
                      return selected ? [...selected, option.id] : [option.id];
                    }
                    return [option.id];
                  })
                }
                type="button"
              >
                {isSubmitting && isSelected ? (
                  <Spinner className="mx-0.5" size="sm" />
                ) : option.voted || isSelected || isWinner ? (
                  <Tooltip
                    content={
                      option.voted ? "You voted for this option" : undefined
                    }
                  >
                    <CheckCircleIcon
                      className={`size-6 ${option.voted ? "text-brand-400" : isWinner ? "text-secondary" : "text-on-surface"}`}
                    />
                  </Tooltip>
                ) : (
                  <div
                    className={cn(
                      "mx-0.5 aspect-1 size-4.5 rounded-full border-2 border-muted"
                    )}
                  />
                )}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between gap-x-2">
                    <div className="font-bold">{option.text}</div>
                    <div className="flex items-center gap-x-1">
                      {isWinner ? (
                        <Tooltip content="Winning option">
                          <TrophyIcon
                            className={`size-4 ${option.voted ? "text-brand-500" : "text-secondary"}`}
                          />
                        </Tooltip>
                      ) : null}
                      <Tooltip
                        content={`${option.voteCount} ${plur("vote", option.voteCount)}`}
                      >
                        <span className="text-secondary">
                          {option.voteCount
                            ? (
                                (option.voteCount / totalVoteCount) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
                    <div
                      className={cn(
                        option.voted ? "bg-brand-400" : "bg-secondary",
                        "h-6"
                      )}
                      style={{
                        width: `${(option.voteCount / totalVoteCount) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </ScrollArea>
        <div className="flex h-12 items-center justify-between gap-x-2 border-border border-t px-4 sm:h-10">
          <div className="flex flex-wrap items-center gap-x-1 text-secondary text-xs">
            <Bars3BottomLeftIcon className="mr-2 size-4" />
            <button
              onClick={() => setShowPostExecutorsModal(true)}
              type="button"
            >
              <span>
                {humanize(totalVoteCount || 0)}{" "}
                {plur("vote", totalVoteCount || 0)}
              </span>
            </button>
            <span>·</span>
            <Tooltip
              content={dayjs(endsAt).format("MMM D, YYYY, h:mm A")}
              showOnClick
            >
              {isPollLive ? (
                <span>{getTimetoNow(new Date(endsAt))} left</span>
              ) : (
                <span>Poll ended</span>
              )}
            </Tooltip>
            {poll.allowMultipleAnswers && (
              <>
                <span>·</span>
                <span>Multiple</span>
                <HelpTooltip>
                  You can select more than one option when voting
                </HelpTooltip>
              </>
            )}
          </div>
          {selectedOptions &&
            selectedOptions.length > 0 &&
            !hasVoted &&
            isPollLive && (
              <Button
                className="m-0 shrink-0"
                disabled={isSubmitting || !currentAccount}
                onClick={handleVote}
                size="sm"
              >
                {currentAccount ? "Submit vote" : "Log in to vote"}
              </Button>
            )}
        </div>
      </Card>
      <Modal
        onClose={() => setShowPostExecutorsModal(false)}
        show={showPostExecutorsModal}
        title="Voters"
      >
        <Voters poll={poll} post={post} />
      </Modal>
    </>
  );
};

export default Choices;

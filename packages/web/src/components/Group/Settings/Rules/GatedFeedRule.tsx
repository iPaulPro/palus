import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { type GroupFragment, useUpdateFeedRulesMutation } from "@palus/indexer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { CONTRACTS } from "@/data/contracts";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import type { ApolloClientError } from "@/types/errors";

interface Props {
  group: GroupFragment;
}

const GatedFeedRule = ({ group }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleTransactionLifecycle = useTransactionLifecycle();

  const feed = group.feed;

  const gatedFeedRule = feed?.rules?.required?.find(
    (rule) => rule.address === CONTRACTS.groupGatedFeedRule
  );
  const [isGatedFeedRuleEnabled, setIsGatedFeedRuleEnabled] = useState(
    gatedFeedRule !== undefined
  );

  const onCompleted = () => {
    setIsSubmitting(false);
    setIsGatedFeedRuleEnabled(!isGatedFeedRuleEnabled);
    toast.success("Feed rule updated");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [updateFeedRules] = useUpdateFeedRulesMutation({
    onCompleted: async ({ updateFeedRules }) => {
      if (updateFeedRules.__typename === "UpdateFeedRulesResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: updateFeedRules
      });
    },
    onError
  });

  if (!feed) {
    return null;
  }

  const handleUpdateRule = () => {
    setIsSubmitting(true);

    return updateFeedRules({
      variables: {
        request: {
          feed: feed.address,
          ...(isGatedFeedRuleEnabled
            ? { toRemove: [gatedFeedRule?.id] }
            : {
                toAdd: {
                  required: [
                    {
                      groupGatedRule: {
                        group: group.address,
                        repliesRestricted: true
                      }
                    }
                  ]
                }
              })
        }
      }
    });
  };

  return (
    <div className="m-5">
      <ToggleWithHelper
        description="Toggle to limit comments to members"
        disabled={isSubmitting}
        heading="Restrict Comments"
        icon={<ChatBubbleLeftIcon className="size-5" />}
        on={isGatedFeedRuleEnabled}
        setOn={handleUpdateRule}
      />
    </div>
  );
};

export default GatedFeedRule;

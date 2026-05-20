import { useApolloClient } from "@apollo/client";
import {
  type AccountFragment,
  type PostFragment,
  useExecuteAccountActionMutation,
  useExecutePostActionMutation
} from "@palus/indexer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useUmami from "@/hooks/useUmami";
import type { ApolloClientError } from "@/types/errors";

interface Props {
  account?: AccountFragment;
  post?: PostFragment;
  amount: number;
  onSuccess?: () => void;
  onFailure?: (error: ApolloClientError) => void;
}

export const useSendTip = ({
  account,
  post,
  amount,
  onSuccess,
  onFailure
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransactionLifecycle = useTransactionLifecycle();
  const { cache } = useApolloClient();
  const { track } = useUmami();

  const updateCache = () => {
    if (!post) return;

    if (!post.operations) {
      return;
    }

    cache.modify({
      fields: { hasTipped: () => true },
      id: cache.identify(post.operations)
    });
    cache.modify({
      fields: {
        stats: (existingData) => ({
          ...existingData,
          tips: existingData.tips + 1
        })
      },
      id: cache.identify(post)
    });
  };

  const onCompleted = () => {
    setIsSubmitting(false);
    updateCache();
    toast.success(`Tipped ${amount.toFixed(2)} ${NATIVE_TOKEN_SYMBOL}`);
    onSuccess?.();
    track("Tip", { amount, type: post ? "Post" : "Account" });
  };

  const onError = useCallback(
    (error: ApolloClientError) => {
      setIsSubmitting(false);
      errorToast(error);
      onFailure?.(error);
    },
    [onFailure]
  );

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

  const [executeAccountAction] = useExecuteAccountActionMutation({
    onCompleted: async ({ executeAccountAction }) => {
      if (executeAccountAction.__typename === "ExecuteAccountActionResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: executeAccountAction
      });
    },
    onError
  });

  const send = () => {
    setIsSubmitting(true);

    if (post) {
      return executePostAction({
        variables: {
          request: {
            action: { tipping: { native: amount.toString() } },
            post: post.id
          }
        }
      });
    }

    if (account) {
      return executeAccountAction({
        variables: {
          request: {
            account: account.address,
            action: { tipping: { native: amount.toString() } }
          }
        }
      });
    }
  };

  return { isSending: isSubmitting, send };
};

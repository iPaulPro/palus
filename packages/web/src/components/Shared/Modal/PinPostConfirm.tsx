import {
  useConfigureAccountActionMutation,
  useExecuteAccountActionMutation
} from "@palus/indexer";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useConfig, useReadContract } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";
import Skeleton from "@/components/Shared/Skeleton";
import { Button } from "@/components/Shared/UI";
import { pinPostAccountActionAbi } from "@/data/abis/pinPostAccountActionAbi";
import { CHAIN } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { encodeParamData } from "@/helpers/encodeParamData";
import { encodeParamKey } from "@/helpers/encodeParamKey";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import { usePinPostModalStore } from "@/store/non-persisted/modal/usePinPostModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

const PinPostConfirm = () => {
  const { currentAccount } = useAccountStore();
  const { setShowPinPostModal, post, isPinned } = usePinPostModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = useConfig();
  const queryClient = useQueryClient();

  const { data: isActionConfigured, isFetching } = useReadContract({
    abi: pinPostAccountActionAbi,
    address: CONTRACTS.pinPostAccountAction,
    args: [currentAccount?.address],
    chainId: CHAIN.id,
    functionName: "isConfigured",
    query: {
      enabled: Boolean(currentAccount?.address)
    }
  });

  const [newlyConfigured, setNewlyConfigured] = useState(false);
  const isConfigured = newlyConfigured || (isActionConfigured ?? false);

  const handleTransactionLifecycle = useTransactionLifecycle();

  const updateCache = () => {
    const { queryKey } = readContractQueryOptions(config, {
      abi: pinPostAccountActionAbi,
      address: CONTRACTS.pinPostAccountAction,
      args: [currentAccount?.address],
      chainId: CHAIN.id,
      functionName: "pinnedPosts"
    });

    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!post) return oldData;
      return isPinned ? 0n : BigInt(post.id);
    });
  };

  const onConfigureCompleted = () => {
    setIsSubmitting(false);
    setNewlyConfigured(true);
  };

  const onExecuteCompleted = () => {
    setIsSubmitting(false);
    toast.success(isPinned ? "Post unpinned" : "Post pinned");
    updateCache();
    setShowPinPostModal(false);
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [configureAccountAction] = useConfigureAccountActionMutation({
    onCompleted: async ({ configureAccountAction }) => {
      if (
        configureAccountAction.__typename === "ConfigureAccountActionResponse"
      ) {
        return onConfigureCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted: onConfigureCompleted,
        onError,
        transactionData: configureAccountAction
      });
    }
  });

  const [executeAccountAction, executeRequest] =
    useExecuteAccountActionMutation({
      onCompleted: async ({ executeAccountAction }) => {
        if (
          executeAccountAction.__typename === "ExecuteAccountActionResponse"
        ) {
          return onExecuteCompleted();
        }

        return await handleTransactionLifecycle({
          onCompleted: onExecuteCompleted,
          onError,
          transactionData: executeAccountAction
        });
      },
      onError
    });

  const handleConfigureAction = async () => {
    const account = currentAccount?.address;
    if (!account) return;

    setIsSubmitting(true);

    return await configureAccountAction({
      variables: {
        request: {
          action: {
            unknown: {
              address: CONTRACTS.pinPostAccountAction
            }
          }
        }
      }
    });
  };

  const handleTogglePinPost = async () => {
    const account = currentAccount?.address;
    if (!account || !post?.feed) return;

    setIsSubmitting(true);

    return await executeAccountAction({
      variables: {
        request: {
          account,
          action: {
            unknown: {
              address: CONTRACTS.pinPostAccountAction,
              params: [
                {
                  data: encodeParamData("uint256", BigInt(post.id)),
                  key: encodeParamKey("lens.param.postId")
                },
                {
                  data: encodeParamData("address", post.feed.address),
                  key: encodeParamKey("lens.param.feed")
                }
              ]
            }
          }
        }
      }
    });
  };

  if (isFetching) {
    return (
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-2/3 rounded-lg" />
        </div>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="space-y-5 p-5">
        <div>
          You must first enable this Account Action before you're able to pin
          posts to you profile.
          <br />
          <br />
          Pins are visible across all Lens apps.
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={() => setShowPinPostModal(false)} variant="outline">
            Cancel
          </Button>
          <Button
            data-umami-event="Pin Post"
            data-umami-event-type="Configure"
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleConfigureAction}
          >
            Enable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      {isPinned ? (
        <div>
          It will still be visible on your feed, but it will no longer be
          featured at the top of your profile.
        </div>
      ) : (
        <div>
          This will appear at the top of your profile and replace any previously
          pinned post.
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => {
            if (executeRequest.called) executeRequest.reset();
            setShowPinPostModal(false);
          }}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          className={isSubmitting ? "w-full" : "w-fit"}
          data-umami-event="Pin Post"
          data-umami-event-type={isPinned ? "Unpin" : "Pin"}
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText="Waiting for wallet signature…"
          onClick={handleTogglePinPost}
        >
          {isPinned ? "Unpin" : "Pin"}
        </Button>
      </div>
    </div>
  );
};

export default PinPostConfirm;

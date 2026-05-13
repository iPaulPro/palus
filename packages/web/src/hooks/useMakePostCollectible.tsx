import { useApolloClient } from "@apollo/client";
import {
  PostDocument,
  type PostFragment,
  useConfigurePostActionMutation,
  usePostLazyQuery
} from "@palus/indexer";
import { useCallback } from "react";
import { toast } from "sonner";
import collectActionParams from "@/helpers/collectActionParams";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useWaitForTransactionToBeIndexed from "@/hooks/useWaitForTransactionToBeIndexed";
import { useCollectFormModalStore } from "@/store/non-persisted/modal/useCollectFormModalStore";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import type { ApolloClientError } from "@/types/errors";
import type { CollectActionType } from "@/types/palus";

interface Props {
  post: PostFragment;
}

const useMakePostCollectible = ({ post }: Props) => {
  const { submittingPost, setSubmittingPost } = useCollectFormModalStore();

  const handleTransactionLifecycle = useTransactionLifecycle();
  const waitForTransactionToComplete = useWaitForTransactionToBeIndexed();

  const [getPost] = usePostLazyQuery();
  const { cache } = useApolloClient();
  const isComment = Boolean(post.commentOn);

  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setQuotedPost } = usePostStore();

  const handleShare = () => {
    setQuotedPost(post);
    setShowNewPostModal(true);
  };

  const updateCache = useCallback(
    async (toastId: string | number) => {
      const { data } = await getPost({
        fetchPolicy: "network-only",
        variables: { request: { post: post.id } }
      });

      if (!data?.post) {
        return;
      }

      const type = isComment ? "Comment" : "Post";

      toast.success(`${type} made collectible!`, {
        action: {
          label: "Share",
          onClick: handleShare
        },
        id: toastId
      });
      cache.modify({
        fields: {
          [isComment ? "postReferences" : "posts"]: () => {
            cache.writeQuery({ data: data.post, query: PostDocument });
          }
        }
      });
    },
    [getPost, cache, isComment, post.id]
  );

  const onCompleted = () => {
    setSubmittingPost(undefined);
  };

  const onError = (error: ApolloClientError) => {
    setSubmittingPost(undefined);
    errorToast(error);
  };

  const onCompletedWithTransaction = useCallback(
    async (hash: string) => {
      const toastId = toast.loading("Making collectible...");
      try {
        await waitForTransactionToComplete(hash);
      } catch (e: any) {
        toast.error(e.message, { id: toastId });
        return;
      }
      await updateCache(toastId);
      return onCompleted();
    },
    [waitForTransactionToComplete, updateCache, isComment]
  );

  const [configurePostAction] = useConfigurePostActionMutation({
    onCompleted: async ({ configurePostAction }) => {
      if (configurePostAction.__typename === "ConfigurePostActionResponse") {
        return onCompletedWithTransaction(configurePostAction.hash);
      }

      return await handleTransactionLifecycle({
        onCompleted: onCompletedWithTransaction,
        onError,
        transactionData: configurePostAction
      });
    }
  });

  const submit = useCallback(
    async (collectAction: CollectActionType) => {
      const params = collectActionParams(collectAction);
      if (!params) {
        errorToast("Invalid collect action parameters");
        return;
      }

      setSubmittingPost(post.id);

      return await configurePostAction({
        variables: {
          request: {
            params,
            post: post.id
          }
        }
      });
    },
    [configurePostAction, post.id]
  );

  return { isSubmitting: submittingPost === post.id, submit };
};

export default useMakePostCollectible;

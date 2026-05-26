import { useApolloClient } from "@apollo/client";
import { useEditPostMutation, usePostLazyQuery } from "@palus/indexer";
import { useCallback } from "react";
import { toast } from "sonner";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import type { ApolloClientError } from "@/types/errors";
import useTransactionLifecycle from "./useTransactionLifecycle";
import useWaitForTransactionToBeIndexed from "./useWaitForTransactionToBeIndexed";

interface EditPostProps {
  onCompleted: () => void;
  onError: (error: ApolloClientError) => void;
}

const useEditPost = ({ onCompleted, onError }: EditPostProps) => {
  const handleTransactionLifecycle = useTransactionLifecycle();
  const { editingPost, setEditingPost } = usePostStore();
  const waitForTransactionToComplete = useWaitForTransactionToBeIndexed();
  const [getPost] = usePostLazyQuery();
  const { cache } = useApolloClient();

  const updateCache = useCallback(
    async (toastId: string | number) => {
      const { data } = await getPost({
        fetchPolicy: "cache-and-network",
        variables: { request: { post: editingPost?.id } }
      });

      if (!data?.post) {
        toast.error("Post is still processing. Please refresh in a moment.", {
          id: toastId
        });
        return;
      }

      setEditingPost(undefined);
      toast.success("Post edited successfully!", { id: toastId });
      cache.modify({
        fields: { post: () => data.post },
        id: cache.identify(data.post)
      });
    },
    [getPost, cache, editingPost?.id, setEditingPost]
  );

  const onCompletedWithTransaction = useCallback(
    async (hash: string) => {
      const toastId = toast.loading("Editing post...");
      try {
        await waitForTransactionToComplete(hash);
      } catch (e: any) {
        toast.error(e.message, { id: toastId });
        return onError(e);
      }
      await updateCache(toastId);
      return onCompleted();
    },
    [waitForTransactionToComplete, updateCache, onCompleted, onError]
  );

  // Onchain mutations
  const [editPost] = useEditPostMutation({
    onCompleted: async ({ editPost }) => {
      if (editPost.__typename === "PostResponse") {
        return onCompletedWithTransaction(editPost.hash);
      }

      return await handleTransactionLifecycle({
        onCompleted: onCompletedWithTransaction,
        onError,
        transactionData: editPost
      });
    },
    onError
  });

  return { editPost };
};

export default useEditPost;

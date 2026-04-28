import { useApolloClient } from "@apollo/client";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import {
  PostDocument,
  type PostFragment,
  useConfigurePostActionMutation,
  usePostLazyQuery
} from "@palus/indexer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import CollectForm from "@/components/Composer/Actions/CollectSettings/CollectForm";
import { Button, Modal, Tooltip } from "@/components/Shared/UI";
import collectActionParams from "@/helpers/collectActionParams";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useWaitForTransactionToBeIndexed from "@/hooks/useWaitForTransactionToBeIndexed";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import type { ApolloClientError } from "@/types/errors";
import type { CollectActionType } from "@/types/palus";

interface Props {
  post: PostFragment;
}

const MakeCollectible = ({ post }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { reset } = useCollectActionStore((state) => state);
  const { setLicense } = usePostLicenseStore();

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
    setIsSubmitting(false);
  };

  const onError = (error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  };

  const onCompletedWithTransaction = useCallback(
    async (hash: string) => {
      const toastId = toast.loading(
        `${isComment ? "Comment" : "Post"} processing...`
      );
      await waitForTransactionToComplete(hash);
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

  const handleSubmit = useCallback(
    async (collectAction: CollectActionType) => {
      const params = collectActionParams(collectAction);
      if (!params) {
        errorToast("Invalid collect action parameters");
        return;
      }

      setIsSubmitting(true);

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

  if (
    post.actions.find((action) => action.__typename === "SimpleCollectAction")
  ) {
    return null;
  }

  return (
    <>
      <Tooltip content="Make this post collectible" placement="top" withDelay>
        <Button
          disabled={isSubmitting}
          icon={<ShoppingBagIcon className="-mt-0.5 size-5" />}
          loading={isSubmitting}
          onClick={() => setShowModal(true)}
          outline
        >
          Make Collectible
        </Button>
      </Tooltip>
      <Modal
        onClose={() => {
          setShowModal(false);
          setLicense(null);
          reset();
        }}
        show={showModal}
        title="Collect Settings"
      >
        <CollectForm onSubmit={handleSubmit} setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default MakeCollectible;

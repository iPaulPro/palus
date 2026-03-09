import { useApolloClient } from "@apollo/client";
import { type AccountFragment, useUnfollowMutation } from "@palus/indexer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, Modal } from "@/components/Shared/UI";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import { useAuthModalStore } from "@/store/non-persisted/modal/useAuthModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

interface UnfollowProps {
  buttonClassName: string;
  account: AccountFragment;
  small: boolean;
  title: string;
}

const Unfollow = ({
  buttonClassName,
  account,
  small,
  title
}: UnfollowProps) => {
  const { currentAccount } = useAccountStore();
  const { setShowAuthModal } = useAuthModalStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cache } = useApolloClient();
  const handleTransactionLifecycle = useTransactionLifecycle();

  const updateCache = () => {
    if (!account.operations) {
      return;
    }

    cache.modify({
      fields: { isFollowedByMe: () => false },
      id: cache.identify(account.operations)
    });
  };

  const onCompleted = () => {
    updateCache();
    setIsSubmitting(false);
    toast.success("Unfollowed successfully");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [unfollow] = useUnfollowMutation({
    onCompleted: async ({ unfollow }) => {
      if (unfollow.__typename === "UnfollowResponse") {
        return onCompleted();
      }

      if (unfollow.__typename === "AccountFollowOperationValidationFailed") {
        return onError({
          message: unfollow.reason,
          name: "AccountFollowOperationValidationFailed"
        });
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: unfollow
      });
    },
    onError
  });

  const handleCreateUnfollow = async () => {
    if (!currentAccount) {
      return setShowAuthModal(true);
    }

    setIsSubmitting(true);
    return await unfollow({
      variables: { request: { account: account.address } }
    });
  };

  return (
    <>
      <Button
        aria-label={title}
        className={buttonClassName}
        disabled={isSubmitting}
        loading={isSubmitting}
        onClick={() => setModalOpen(true)}
        size={small ? "sm" : "md"}
      >
        {title}
      </Button>
      <Modal
        onClose={() => setModalOpen(false)}
        show={modalOpen}
        size="xs"
        title="Are you sure?"
      >
        <div className="space-y-5 p-5">
          <p>
            Unfollow this account to stop seeing their posts in your Timeline
            feed.
          </p>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} outline>
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              loading={isSubmitting}
              onClick={handleCreateUnfollow}
            >
              Unfollow
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Unfollow;

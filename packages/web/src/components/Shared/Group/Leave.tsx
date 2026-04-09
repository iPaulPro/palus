import { useApolloClient } from "@apollo/client";
import { type GroupFragment, useLeaveGroupMutation } from "@palus/indexer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Alert, Button } from "@/components/Shared/UI";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import type { ApolloClientError } from "@/types/errors";

interface LeaveProps {
  group: GroupFragment;
  small: boolean;
}

const Leave = ({ group, small }: LeaveProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cache } = useApolloClient();
  const handleTransactionLifecycle = useTransactionLifecycle();

  const updateCache = () => {
    cache.modify({
      fields: {
        groupStats: (existingGroupStats, { storeFieldName }) => {
          if (!storeFieldName.includes(group.address)) {
            return existingGroupStats;
          }

          if (!existingGroupStats) {
            return existingGroupStats;
          }

          const totalMembers = existingGroupStats.totalMembers ?? 1;
          return {
            ...existingGroupStats,
            totalMembers: totalMembers - 1
          };
        }
      }
    });

    if (!group.operations) {
      return;
    }

    cache.modify({
      fields: { isMember: () => false },
      id: cache.identify(group.operations)
    });
  };

  const onCompleted = () => {
    updateCache();
    setIsSubmitting(false);
    toast.success("Left group");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [leaveGroup] = useLeaveGroupMutation({
    onCompleted: async ({ leaveGroup }) => {
      if (leaveGroup.__typename === "LeaveGroupResponse") {
        return onCompleted();
      }

      if (leaveGroup.__typename === "GroupOperationValidationFailed") {
        return onError({
          message: leaveGroup.reason,
          name: "GroupOperationValidationFailed"
        });
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: leaveGroup
      });
    },
    onError
  });

  const handleLeave = async () => {
    setIsSubmitting(true);

    return await leaveGroup({
      variables: { request: { group: group.address } }
    });
  };

  return (
    <>
      <Button
        aria-label="Leave"
        className="flex-none"
        disabled={isSubmitting}
        loading={isSubmitting}
        onClick={() => setModalOpen(true)}
        outline
        size={small ? "sm" : "md"}
      >
        Leave
      </Button>
      <Alert
        confirmText="Leave Group"
        description="Leaving this group will remove you from the member list and you will
            lose access to any exclusive content or benefits associated with the
            group."
        isPerformingAction={isSubmitting}
        onClose={() => setModalOpen(false)}
        onConfirm={handleLeave}
        show={modalOpen}
        title="Are you sure?"
      />
    </>
  );
};

export default Leave;

import type { ApolloCache, NormalizedCacheObject } from "@apollo/client";
import { UsersIcon } from "@heroicons/react/24/outline";
import {
  type ApproveGroupMembershipRequest,
  type GroupMembershipRequestsRequest,
  type RejectGroupMembershipRequest,
  useApproveGroupMembershipRequestsMutation,
  useGroupMembershipRequestsQuery,
  useRejectGroupMembershipRequestsMutation
} from "@palus/indexer";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { Virtualizer } from "virtua";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import Loader from "@/components/Shared/Loader";
import AccountListShimmer from "@/components/Shared/Shimmer/AccountListShimmer";
import {
  EmptyState,
  ErrorMessage,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectUI,
  SelectValue
} from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import { accountsList } from "@/helpers/variants";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import type { ApolloClientError } from "@/types/errors";

interface Props {
  groupAddress: string;
}

const Requests = ({ groupAddress }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const request: GroupMembershipRequestsRequest = { group: groupAddress };

  const { data, loading, error, fetchMore } = useGroupMembershipRequestsQuery({
    variables: { request }
  });

  const requests = data?.groupMembershipRequests.items;
  const pageInfo = data?.groupMembershipRequests.pageInfo;
  const hasMore = pageInfo?.next;

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  const updateCache = (
    cache: ApolloCache<NormalizedCacheObject>,
    account: string,
    isApproval: boolean
  ) => {
    cache.modify({
      fields: {
        groupMembershipRequests(existing, { readField }) {
          return {
            ...existing,
            items: existing.items.filter(
              (itemRef: any) =>
                readField("address", readField("account", itemRef)) !== account
            )
          };
        }
      }
    });

    if (isApproval) {
      cache.modify({
        fields: {
          groupMembers(existing, { toReference }) {
            if (!existing) return existing;
            const accountRef = toReference({
              __typename: "Account",
              address: account
            });
            return {
              ...existing,
              items: [{ account: accountRef }, ...existing.items]
            };
          },
          groupStats(existing, { readField }) {
            if (!existing) return existing;
            const currentTotal = readField("totalMembers", existing) as number;
            return {
              ...existing,
              totalMembers: currentTotal + 1
            };
          }
        }
      });
    }
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(null);
    errorToast(error);
  }, []);

  const [approveRequest] = useApproveGroupMembershipRequestsMutation({
    onCompleted: () => setIsSubmitting(null),
    onError
  });
  const [rejectRequest] = useRejectGroupMembershipRequestsMutation({
    onCompleted: () => setIsSubmitting(null),
    onError
  });

  if (loading) {
    return <AccountListShimmer />;
  }

  if (!requests?.length) {
    return (
      <EmptyState
        className="text-sm"
        hideCard
        icon={<UsersIcon className="size-8" />}
        message="Group doesn't have any membership requests."
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load membership requests"
      />
    );
  }

  const handleSelectChange = async (account: string, value: string) => {
    setIsSubmitting(account);

    if (value === "approve") {
      await approveRequest({
        update: (cache) => updateCache(cache, account, true),
        variables: {
          request: {
            accounts: [account],
            group: groupAddress
          } as ApproveGroupMembershipRequest
        }
      });
    } else if (value === "reject") {
      await rejectRequest({
        update: (cache) => updateCache(cache, account, false),
        variables: {
          request: {
            accounts: [account],
            group: groupAddress
          } as RejectGroupMembershipRequest
        }
      });
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtualizer>
        {requests.map((request, index) => (
          <motion.div
            animate="visible"
            className={cn(
              "divider flex items-center justify-between gap-x-4 p-5",
              index === requests.length - 1 && "border-b-0"
            )}
            initial="hidden"
            key={request.account.address}
            variants={accountsList}
          >
            <SingleAccount
              account={request.account}
              hideFollowButton
              hideUnfollowButton
              showUserPreview
            />
            {isSubmitting === request.account.address ? (
              <Loader className="mr-1" small />
            ) : (
              <SelectUI
                disabled={Boolean(isSubmitting)}
                onValueChange={(value) =>
                  handleSelectChange(request.account.address, value)
                }
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Respond" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem
                    className="min-w-48"
                    disabled={Boolean(isSubmitting)}
                    value="approve"
                  >
                    Approve
                  </SelectItem>
                  <SelectItem
                    className="min-w-48"
                    disabled={Boolean(isSubmitting)}
                    value="reject"
                  >
                    Reject
                  </SelectItem>
                </SelectContent>
              </SelectUI>
            )}
          </motion.div>
        ))}
        {hasMore && <div className="h-0.5" ref={loadMoreRef} />}
      </Virtualizer>
    </div>
  );
};

export default Requests;

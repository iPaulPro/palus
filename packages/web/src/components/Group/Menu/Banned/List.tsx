import { UserGroupIcon } from "@heroicons/react/24/outline";
import {
  GroupBannedAccountsOrderBy,
  type GroupBannedAccountsRequest,
  type GroupFragment,
  PageSize,
  useGroupBannedAccountsQuery
} from "@palus/indexer";
import { motion } from "motion/react";
import { useCallback, useMemo } from "react";
import { Virtualizer } from "virtua";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import AccountListShimmer from "@/components/Shared/Shimmer/AccountListShimmer";
import { EmptyState, ErrorMessage } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { accountsList } from "@/helpers/variants";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import AdminActions from "./Actions";

interface Props {
  group: GroupFragment;
}

const BannedList = ({ group }: Props) => {
  const { currentAccount } = useAccountStore();

  const request: GroupBannedAccountsRequest = useMemo(
    () => ({
      group: group.address,
      orderBy: GroupBannedAccountsOrderBy.LastBanned,
      pageSize: PageSize.Fifty
    }),
    [group.address]
  );

  const { data, error, fetchMore, loading } = useGroupBannedAccountsQuery({
    skip: !group.address,
    variables: { request }
  });

  const accounts = data?.groupBannedAccounts?.items;
  const pageInfo = data?.groupBannedAccounts?.pageInfo;
  const hasMore = pageInfo?.next;

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  if (loading) {
    return <AccountListShimmer />;
  }

  if (!accounts?.length) {
    return (
      <div className="p-5">
        <EmptyState
          hideCard
          icon={<UserGroupIcon className="size-8" />}
          message="No banned accounts"
        />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load banned accounts"
      />
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtualizer>
        {accounts.map((banned, index) => (
          <motion.div
            animate="visible"
            className={cn(
              "divider p-5",
              index === accounts.length - 1 && "border-b-0"
            )}
            initial="hidden"
            key={banned.account.address}
            variants={accountsList}
          >
            <SingleAccount
              account={banned.account}
              action={<AdminActions account={banned.account} group={group} />}
              hideFollowButton={
                currentAccount?.address === banned.account.address
              }
              hideUnfollowButton={
                currentAccount?.address === banned.account.address
              }
            />
          </motion.div>
        ))}
        {hasMore && <div className="h-0.5" ref={loadMoreRef} />}
      </Virtualizer>
    </div>
  );
};

export default BannedList;

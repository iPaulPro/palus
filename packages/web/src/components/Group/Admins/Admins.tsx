import { UserGroupIcon } from "@heroicons/react/24/outline";
import type { AccountFragment, GroupFragment } from "@palus/indexer";
import { motion } from "motion/react";
import { Virtualizer } from "virtua";
import AdminActions from "@/components/Group/Members/Actions";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import AccountListShimmer from "@/components/Shared/Shimmer/AccountListShimmer";
import { EmptyState, ErrorMessage } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { accountsList } from "@/helpers/variants";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface AdminAccountsProps {
  accounts: AccountFragment[] | undefined;
  group: GroupFragment;
  loading: boolean;
  error?: Error;
}

const Admins = ({ accounts, group, loading, error }: AdminAccountsProps) => {
  const { currentAccount } = useAccountStore();

  if (loading) {
    return <AccountListShimmer />;
  }

  if (!accounts?.length) {
    return (
      <div className="p-5">
        <EmptyState
          hideCard
          icon={<UserGroupIcon className="size-8" />}
          message="No admins"
        />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load admins"
      />
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtualizer>
        {accounts.map((account, index) => (
          <motion.div
            animate="visible"
            className={cn(
              "divider p-5",
              index === accounts.length - 1 && "border-b-0"
            )}
            initial="hidden"
            key={account.address}
            variants={accountsList}
          >
            <SingleAccount
              account={account}
              action={
                <AdminActions
                  account={account}
                  admins={accounts}
                  group={group}
                />
              }
              hideFollowButton={currentAccount?.address === account.address}
              hideUnfollowButton={currentAccount?.address === account.address}
            />
          </motion.div>
        ))}
      </Virtualizer>
    </div>
  );
};

export default Admins;

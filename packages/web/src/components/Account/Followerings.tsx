import { type AccountFragment, useAccountStatsQuery } from "@palus/indexer";
import plur from "plur";
import { useState } from "react";
import Followers from "@/components/Shared/Modal/Followers";
import Following from "@/components/Shared/Modal/Following";
import GraphStatsShimmer from "@/components/Shared/Shimmer/GraphStatsShimmer";
import { HelpTooltip, Modal } from "@/components/Shared/UI";
import getAccount from "@/helpers/getAccount";
import humanize from "@/helpers/humanize";

interface FolloweringsProps {
  account: AccountFragment;
}

const Followerings = ({ account }: FolloweringsProps) => {
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const { data, loading } = useAccountStatsQuery({
    variables: { request: { account: account.address } }
  });

  if (loading) {
    return (
      <div className="pt-1">
        <GraphStatsShimmer count={2} />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const stats = data.accountStats.graphFollowStats;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8">
      <button
        className="flex gap-x-1"
        onClick={() => setShowFollowingModal(true)}
        type="button"
      >
        <b>{humanize(stats?.following)}</b>
        <span className="text-gray-500 dark:text-gray-200">Following</span>
      </button>
      <button
        className="flex gap-x-1"
        onClick={() => setShowFollowersModal(true)}
        type="button"
      >
        <b>{humanize(stats?.followers)}</b>
        <span className="text-gray-500 dark:text-gray-200">
          {plur("Follower", stats?.followers)}
        </span>
      </button>
      <div className="flex gap-x-1">
        <span className="font-bold">{account.score}</span>
        <span className="flex items-center gap-x-1 text-gray-500 dark:text-gray-200">
          Score
          <HelpTooltip>
            Account Score is calculated using a set of machine learning
            algorithms that consider factors like follower graphs, content, and
            other variables. Higher scores suggest a positive and active
            presence within the ecosystem.
          </HelpTooltip>
        </span>
      </div>
      <Modal
        onClose={() => setShowFollowingModal(false)}
        show={showFollowingModal}
        title={"Following"}
      >
        <Following
          address={String(account.address)}
          username={getAccount(account).username}
        />
      </Modal>
      <Modal
        onClose={() => setShowFollowersModal(false)}
        show={showFollowersModal}
        title={"Followers"}
      >
        <Followers
          address={String(account.address)}
          username={getAccount(account).username}
        />
      </Modal>
    </div>
  );
};

export default Followerings;

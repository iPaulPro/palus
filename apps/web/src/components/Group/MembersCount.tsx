import { type GroupFragment, useGroupStatsQuery } from "@palus/indexer";
import { useState } from "react";
import Members from "@/components/Shared/Modal/Members";
import GraphStatsShimmer from "@/components/Shared/Shimmer/GraphStatsShimmer";
import { Modal } from "@/components/Shared/UI";
import humanize from "@/helpers/humanize";

interface MembersCountProps {
  group: GroupFragment;
}

const MembersCount = ({ group }: MembersCountProps) => {
  const [showMembersModal, setShowMembersModal] = useState(false);

  const { data, loading } = useGroupStatsQuery({
    variables: { request: { group: group.address } }
  });

  if (loading) {
    return <GraphStatsShimmer count={1} />;
  }

  if (!data) {
    return null;
  }

  const stats = data.groupStats;

  return (
    <div className="flex gap-8">
      <button
        className="flex gap-x-1"
        onClick={() => setShowMembersModal(true)}
        type="button"
      >
        <b>{humanize(stats?.totalMembers)}</b>
        <span className="text-gray-500 dark:text-gray-200">Members</span>
      </button>
      <Modal
        onClose={() => setShowMembersModal(false)}
        show={showMembersModal}
        title="Members"
      >
        <Members group={group} />
      </Modal>
    </div>
  );
};

export default MembersCount;

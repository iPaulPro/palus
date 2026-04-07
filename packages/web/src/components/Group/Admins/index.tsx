import { type GroupFragment, useAdminsForQuery } from "@palus/indexer";
import plur from "plur";
import { useState } from "react";
import { Modal } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import humanize from "@/helpers/humanize";
import Admins from "./Admins";

interface AdminsProps {
  group: GroupFragment;
}

const AdminCount = ({ group }: AdminsProps) => {
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error } = useAdminsForQuery({
    variables: { request: { address: group.address } }
  });

  const accounts = data?.adminsFor?.items
    .map((item) => item.account)
    .filter(
      (account) =>
        account.address.toLowerCase() !==
        CONTRACTS.banMemberGroupRule.toLowerCase()
    );
  const len = accounts?.length ?? 0;

  if (len === 0) {
    return null;
  }

  return (
    <div className="flex gap-8">
      <button
        className="flex gap-x-1"
        onClick={() => setShowModal(true)}
        type="button"
      >
        <b>{humanize(len)}</b>
        <span className="text-gray-500 dark:text-gray-200">
          {plur("Admin", len)}
        </span>
      </button>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Group Admins"
      >
        <Admins
          accounts={accounts}
          error={error}
          group={group}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default AdminCount;

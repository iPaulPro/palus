import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { GroupFragment } from "@palus/indexer";
import { useState } from "react";
import { Modal, Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import Rules from "./Rules";

interface RulesSettingsProps {
  group?: GroupFragment;
}

const RulesSettings = ({ group }: RulesSettingsProps) => {
  const [showModal, setShowModal] = useState(false);
  const { collectorsOnly, followersOnly, followingOnly, groupGate } =
    usePostRulesStore();
  const hasRules =
    followersOnly || followingOnly || groupGate || collectorsOnly;

  return (
    <>
      <Tooltip content="Rules" placement="top" withDelay>
        <button
          aria-label="Rules"
          className="flex items-center rounded-full outline-offset-8"
          onClick={() => setShowModal(!showModal)}
          type="button"
        >
          <AdjustmentsHorizontalIcon
            className={cn(hasRules && "text-brand-500", "size-5")}
          />
        </button>
      </Tooltip>
      <Modal onClose={() => setShowModal(false)} show={showModal} title="Rules">
        <Rules groupAddress={group?.address} setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default RulesSettings;

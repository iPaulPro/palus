import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { GroupFragment } from "@palus/indexer";
import { useState } from "react";
import { Modal, Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import ContentWarning from "./ContentWarning";
import Rules from "./Rules";

interface RulesSettingsProps {
  group?: GroupFragment;
}

const PostSettings = ({ group }: RulesSettingsProps) => {
  const [showModal, setShowModal] = useState(false);
  const { collectorsOnly, followersOnly, followingOnly, groupGate } =
    usePostRulesStore();
  const { contentWarning } = usePostContentWarningStore();

  const hasRules =
    followersOnly || followingOnly || groupGate || collectorsOnly;

  return (
    <>
      <Tooltip content="Post Settings" placement="top" withDelay>
        <button
          aria-label="Post Settings"
          className="flex items-center rounded-full outline-offset-8"
          onClick={() => setShowModal(!showModal)}
          type="button"
        >
          <AdjustmentsHorizontalIcon
            className={cn(
              (hasRules || Boolean(contentWarning)) && "text-brand-500",
              "size-5"
            )}
          />
        </button>
      </Tooltip>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Post Settings"
      >
        <ContentWarning />
        <div className="divider" />
        <div className="px-5 pt-4 pb-2 font-bold text-sm">Rules</div>
        <Rules groupAddress={group?.address} setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default PostSettings;

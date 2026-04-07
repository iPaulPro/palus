import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import plur from "plur";
import { useState } from "react";
import { Modal, Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import humanize from "@/helpers/humanize";
import nFormatter from "@/helpers/nFormatter";
import CollectActionBody from "./CollectActionBody";

interface CollectActionProps {
  post: PostFragment;
  showCount?: boolean;
}

const CollectAction = ({ post, showCount }: CollectActionProps) => {
  const [showCollectModal, setShowCollectModal] = useState(false);
  const { collects } = post.stats;
  const hasSimpleCollected = post.operations?.hasSimpleCollected;

  return (
    <div
      className={`items-center space-x-1 text-gray-500 dark:text-gray-200 ${showCount ? "flex" : "sm:hidden"}`}
    >
      <button
        aria-label="Collect"
        className="rounded-full p-1.5 outline-offset-2 hover:bg-gray-300/20"
        onClick={() => setShowCollectModal(true)}
        type="button"
      >
        <Tooltip
          content={`${humanize(collects)} ${plur("Collect", collects)}`}
          placement="top"
          withDelay
        >
          <ShoppingBagIcon
            className={cn("size-5", {
              "text-brand-500": hasSimpleCollected
            })}
          />
        </Tooltip>
      </button>
      {collects > 0 && showCount ? (
        <span
          className={cn(
            hasSimpleCollected
              ? "text-brand-500"
              : "text-gray-500 dark:text-gray-200",
            "text-sm"
          )}
        >
          {nFormatter(collects)}
        </span>
      ) : null}
      <Modal
        onClose={() => setShowCollectModal(false)}
        show={showCollectModal}
        title="Collect"
      >
        <CollectActionBody
          post={post}
          setShowCollectModal={setShowCollectModal}
        />
      </Modal>
    </div>
  );
};

export default CollectAction;

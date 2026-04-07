import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ShoppingBagIcon as ShoppingBagIconSolid } from "@heroicons/react/24/solid";
import type { PostFragment } from "@palus/indexer";
import { useState } from "react";
import { Button, Modal } from "@/components/Shared/UI";
import CollectActionBody from "./CollectActionBody";

interface SmallCollectButtonProps {
  post: PostFragment;
}

const SmallCollectButton = ({ post }: SmallCollectButtonProps) => {
  const [showCollectModal, setShowCollectModal] = useState(false);
  const hasSimpleCollected = post.operations?.hasSimpleCollected;

  return (
    <>
      <Button onClick={() => setShowCollectModal(true)} outline>
        {hasSimpleCollected ? (
          <ShoppingBagIconSolid className="size-4 text-brand-500" />
        ) : (
          <ShoppingBagIcon className="size-4" />
        )}
        {hasSimpleCollected ? "Collected" : "Collect"}
      </Button>
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
    </>
  );
};

export default SmallCollectButton;

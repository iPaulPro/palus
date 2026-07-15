import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ShoppingBagIcon as ShoppingBagIconSolid } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import { Modal, Tooltip } from "@/components/Shared/UI";
import CollectForm from "./CollectForm";

const CollectSettings = () => {
  const reset = useComposerStore((state) => state.resetCollectAction);
  const collectAction = useComposerStore((state) => state.collectAction);
  const [showModal, setShowModal] = useState(false);
  const [hasCollect, setHasCollect] = useState(false);

  return (
    <>
      <Tooltip content="Collect Settings" placement="top" withDelay>
        <button
          aria-label="Collect Module"
          className="flex items-center rounded-full outline-offset-8"
          onClick={() => {
            setHasCollect(Boolean(collectAction.enabled));
            setShowModal(!showModal);
          }}
          type="button"
        >
          {collectAction.enabled ? (
            <ShoppingBagIconSolid className="-mt-0.5 size-5 text-brand-400" />
          ) : (
            <ShoppingBagIcon className="-mt-0.5 size-5" />
          )}
        </button>
      </Tooltip>
      <Modal
        onClose={() => {
          setShowModal(false);
          if (!hasCollect) {
            reset();
          }
        }}
        show={showModal}
        title="Collect Settings"
      >
        <CollectForm setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default CollectSettings;

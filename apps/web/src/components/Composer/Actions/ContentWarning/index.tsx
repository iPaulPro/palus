import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from "@heroicons/react/24/solid";
import { ContentWarning as ContentWarningType } from "@palus/indexer";
import { useState } from "react";
import { Modal, Select, Tooltip } from "@/components/Shared/UI";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";

const ContentWarning = () => {
  const [showModal, setShowModal] = useState(false);
  const { contentWarning, setContentWarning } = usePostContentWarningStore();

  const options = [
    {
      label: "None",
      selected: !contentWarning,
      value: "none"
    },
    {
      label: "NSFW",
      selected: contentWarning === ContentWarningType.Nsfw,
      value: ContentWarningType.Nsfw
    },
    {
      label: "Spoiler",
      selected: contentWarning === ContentWarningType.Spoiler,
      value: ContentWarningType.Spoiler
    },
    {
      label: "Sensitive",
      selected: contentWarning === ContentWarningType.Sensitive,
      value: ContentWarningType.Sensitive
    }
  ];

  return (
    <>
      <Tooltip content="Content Warning" placement="top" withDelay>
        <button
          aria-label="Content Warning"
          className="flex items-center rounded-full outline-offset-8"
          onClick={() => setShowModal(!showModal)}
          type="button"
        >
          {contentWarning ? (
            <ExclamationTriangleIconSolid className="size-5" />
          ) : (
            <ExclamationTriangleIcon className="size-5" />
          )}
        </button>
      </Tooltip>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        size="xs"
        title="Content Warning"
      >
        <div className="p-4">
          <Select
            onChange={(value) => {
              setContentWarning(value === "none" ? null : value);
              setShowModal(false);
            }}
            options={options}
          />
        </div>
      </Modal>
    </>
  );
};

export default ContentWarning;

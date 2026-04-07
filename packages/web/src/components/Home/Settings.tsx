import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import IncludeCommentsTimelineToggle from "@/components/Shared/Settings/IncludeCommentsTimelineToggle";
import { Modal, Tooltip } from "@/components/Shared/UI";
import { HomeFeedType } from "@/data/enums";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";

const Settings: FC = () => {
  const { feedType } = useHomeTabStore();
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  const handleOpenSettings = () => setShowNotificationSettings(true);
  const handleCloseSettings = () => setShowNotificationSettings(false);

  if (feedType !== HomeFeedType.TIMELINE) {
    return null;
  }

  return (
    <>
      <button
        className="mx-3 rounded-md p-1 hover:bg-gray-300/20 sm:mx-0"
        onClick={handleOpenSettings}
        type="button"
      >
        <Tooltip content="Timeline settings" placement="top">
          <AdjustmentsHorizontalIcon className="ld-text-gray-500 size-5" />
        </Tooltip>
      </button>
      <Modal
        onClose={handleCloseSettings}
        show={showNotificationSettings}
        size="xs"
        title="Timeline settings"
      >
        <div className="p-5">
          <IncludeCommentsTimelineToggle />
        </div>
      </Modal>
    </>
  );
};

export default Settings;

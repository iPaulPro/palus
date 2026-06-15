import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import HideHeyPostsToggle from "@/components/Shared/Settings/HideHeyPostsToggle";
import HideShareImagePostsToggle from "@/components/Shared/Settings/HideShareImagePostsToggle";
import IncludeCommentsTimelineToggle from "@/components/Shared/Settings/IncludeCommentsTimelineToggle";
import { Modal, Tooltip } from "@/components/Shared/UI";
import { HomeFeedType } from "@/data/enums";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";

const Settings: FC = () => {
  const { feedType } = useHomeTabStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button
        className="rounded-md p-1 hover:bg-gray-300/20 sm:mx-0"
        onClick={() => setShowSettings(true)}
        type="button"
      >
        <Tooltip content="Feed settings" placement="top">
          <AdjustmentsHorizontalIcon className="ld-text-gray-500 size-5" />
        </Tooltip>
      </button>
      <Modal
        onClose={() => setShowSettings(false)}
        show={showSettings}
        size="xs"
        title="Feed settings"
      >
        <div className="flex flex-col gap-y-4 p-5">
          {feedType === HomeFeedType.TIMELINE && (
            <IncludeCommentsTimelineToggle />
          )}
          <HideShareImagePostsToggle />
          <HideHeyPostsToggle />
        </div>
      </Modal>
    </>
  );
};

export default Settings;

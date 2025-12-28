import { Cog6ToothIcon, SwatchIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Modal, Tooltip } from "@/components/Shared/UI";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const Settings: FC = () => {
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  const handleOpenSettings = () => setShowNotificationSettings(true);
  const handleCloseSettings = () => setShowNotificationSettings(false);

  const { includeLowScore, setIncludeLowScore } = usePreferencesStore();

  return (
    <>
      <button
        className="mx-3 rounded-md p-1 hover:bg-gray-300/20 sm:mx-0"
        onClick={handleOpenSettings}
        type="button"
      >
        <Tooltip content="Notification settings" placement="top">
          <Cog6ToothIcon className="ld-text-gray-500 size-5" />
        </Tooltip>
      </button>
      <Modal
        onClose={handleCloseSettings}
        show={showNotificationSettings}
        size="xs"
        title="Notification settings"
      >
        <div className="p-5">
          <ToggleWithHelper
            description="Include notifications from Accounts with a low score"
            heading="Low-signal notifications"
            icon={<SwatchIcon className="size-5" />}
            on={includeLowScore}
            setOn={setIncludeLowScore}
          />
        </div>
      </Modal>
    </>
  );
};

export default Settings;

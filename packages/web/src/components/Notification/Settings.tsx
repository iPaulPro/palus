import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import LowSignalNotificationToggle from "@/components/Shared/Settings/LowSignalNotificationToggle";
import { Modal, Tooltip } from "@/components/Shared/UI";

const Settings: FC = () => {
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  const handleOpenSettings = () => setShowNotificationSettings(true);
  const handleCloseSettings = () => setShowNotificationSettings(false);

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
          <LowSignalNotificationToggle />
        </div>
      </Modal>
    </>
  );
};

export default Settings;

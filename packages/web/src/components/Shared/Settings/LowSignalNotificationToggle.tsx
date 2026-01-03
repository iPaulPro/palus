import { SwatchIcon } from "@heroicons/react/24/outline";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const LowSignalNotificationToggle = () => {
  const { includeLowScore, setIncludeLowScore } = usePreferencesStore();

  return (
    <ToggleWithHelper
      description="Include notifications from Accounts with a low score"
      heading="Low-signal notifications"
      icon={<SwatchIcon className="size-5" />}
      on={includeLowScore}
      setOn={setIncludeLowScore}
    />
  );
};

export default LowSignalNotificationToggle;

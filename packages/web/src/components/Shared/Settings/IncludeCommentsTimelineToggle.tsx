import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const LowSignalNotificationToggle = () => {
  const { includeCommentsInTimeline, setIncludeCommentsInTimeline } =
    usePreferencesStore();

  return (
    <ToggleWithHelper
      description="Show comments in the Timeline feed"
      heading="Include comments"
      icon={<ChatBubbleLeftIcon className="size-5" />}
      on={includeCommentsInTimeline}
      setOn={setIncludeCommentsInTimeline}
    />
  );
};

export default LowSignalNotificationToggle;

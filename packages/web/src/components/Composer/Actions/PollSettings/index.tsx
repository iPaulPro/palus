import { ChartBarIcon } from "@heroicons/react/24/outline";
import { ChartBarIcon as ChartBarIconSolid } from "@heroicons/react/24/solid";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import { Tooltip } from "@/components/Shared/UI";

const PollSettings = () => {
  const resetPollConfig = useComposerStore((state) => state.resetPollConfig);
  const setShowPollEditor = useComposerStore(
    (state) => state.setShowPollEditor
  );
  const showPollEditor = useComposerStore((state) => state.showPollEditor);

  return (
    <Tooltip content="Poll" placement="top">
      <button
        aria-label="Poll"
        className="flex items-center rounded-full outline-offset-8"
        onClick={() => {
          resetPollConfig();
          setShowPollEditor(!showPollEditor);
        }}
        type="button"
      >
        {showPollEditor ? (
          <ChartBarIconSolid className="size-5 text-brand-400" />
        ) : (
          <ChartBarIcon className="size-5" />
        )}
      </button>
    </Tooltip>
  );
};

export default PollSettings;

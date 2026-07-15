import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { m } from "motion/react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";

interface FloatingNewPostButtonProps {
  scrollOffset: number;
}

const FloatingNewPostButton = ({
  scrollOffset
}: FloatingNewPostButtonProps) => {
  const { open: openNewPostModal } = useNewPostModalStore();
  const { isUnloaded } = useAudioPlayerContext();

  const isVisible = scrollOffset >= 200;

  const onClick = () => {
    openNewPostModal();
  };

  return (
    <m.div
      animate={{ y: isVisible ? 0 : 200 }}
      className="fixed right-5 z-10 mb-12 block md:hidden"
      initial={{ y: 200 }}
      style={{
        bottom: `calc(${isUnloaded ? "1.5rem" : "6rem"} + env(safe-area-inset-bottom))`,
        transition: "bottom 250ms ease"
      }}
      transition={{ damping: 20, stiffness: 260, type: "spring" }}
    >
      <button
        className="center flex size-14 rounded-full bg-brand-500 text-white opacity-90 shadow-lg active:bg-brand-600 md:hidden dark:bg-brand-700 dark:active:bg-brand-600"
        onClick={onClick}
        type="button"
      >
        <PencilSquareIcon className="mb-0.5 ml-0.5 size-6" />
      </button>
    </m.div>
  );
};

export default FloatingNewPostButton;

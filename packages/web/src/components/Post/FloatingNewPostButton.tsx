import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useMediaQuery } from "@uidotdev/usehooks";
import { m } from "motion/react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";

interface FloatingNewPostButtonProps {
  scrollOffset: number;
}

const FloatingNewPostButton = ({
  scrollOffset
}: FloatingNewPostButtonProps) => {
  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { isUnloaded } = useAudioPlayerContext();

  const isVisible = scrollOffset >= 200;
  const isMobile = useMediaQuery(IS_MOBILE);

  const onClick = () => {
    setShowNewPostModal(true);
  };

  const bottom =
    isMobile && !isUnloaded
      ? "10rem"
      : isUnloaded
        ? isMobile
          ? "6rem"
          : "4rem"
        : "8rem";

  return (
    <m.div
      animate={{ bottom, y: isVisible ? 0 : 200 }}
      className="fixed right-5 block md:hidden"
      initial={{ bottom, y: 200 }}
      transition={{ damping: 20, stiffness: 260, type: "spring" }}
    >
      <button
        className="center flex size-14 rounded-full bg-brand-500 text-white opacity-90 shadow-lg active:bg-brand-600 dark:bg-brand-700 dark:active:bg-brand-600"
        onClick={onClick}
        type="button"
      >
        <PencilSquareIcon className="mb-0.5 ml-0.5 size-6" />
      </button>
    </m.div>
  );
};

export default FloatingNewPostButton;

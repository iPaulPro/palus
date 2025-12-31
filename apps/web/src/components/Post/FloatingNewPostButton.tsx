import { PlusIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import cn from "@/helpers/cn";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";

interface FloatingNewPostButtonProps {
  scrollOffset: number;
}

const FloatingNewPostButton = ({
  scrollOffset
}: FloatingNewPostButtonProps) => {
  const { setShow: setShowNewPostModal } = useNewPostModalStore();

  const isVisible = scrollOffset >= 200;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  const onClick = () => {
    setShowNewPostModal(true);
  };

  return (
    <motion.div
      animate={{ y: isVisible ? 0 : 200 }}
      className={cn("fixed right-5 bottom-20 block md:hidden", {
        "bottom-24": isStandalone
      })}
      initial={{ y: 200 }}
      transition={{ damping: 20, stiffness: 260, type: "spring" }}
    >
      <button
        className="center flex size-14 rounded-full bg-brand-500 text-white opacity-90 shadow-lg active:bg-brand-600 dark:bg-brand-700 dark:active:bg-brand-600"
        onClick={onClick}
        type="button"
      >
        <PlusIcon className="size-6" />
      </button>
    </motion.div>
  );
};

export default FloatingNewPostButton;

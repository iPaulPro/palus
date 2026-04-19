import { type PanInfo, useAnimation, useMotionValue } from "motion/react";
import { useRef } from "react";

const defaultOptions = {
  dismissThreshold: 0.35,
  snapbackDuration: 0.1,
  snapbackEasing: "easeOut"
};

const useSwipeToDismiss = (
  options: {
    /** Fraction of element width at which dismiss fires (0–1). Default 0.5 */
    dismissThreshold?: number;

    /** Called immediately when threshold is exceeded on release */
    onDismiss?: () => void;

    /** Called after the element has animated off-screen */
    onDismissEnd?: () => void;

    /** Duration (seconds) of snapback animation */
    snapbackDuration?: number;

    /** Easing for snapback */
    snapbackEasing?: string;
  } = {}
) => {
  const { dismissThreshold, onDismiss, onDismissEnd, snapbackDuration } = {
    ...defaultOptions,
    ...options
  };

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const width = ref.current?.offsetWidth ?? 300;
    const threshold = width * dismissThreshold;

    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 1 : -1;
      onDismiss?.();
      await controls.start({
        transition: { duration: snapbackDuration },
        x: direction * width * 2
      });
      onDismissEnd?.();
    } else {
      await controls.start({
        transition: { duration: snapbackDuration },
        x: 0
      });
    }
  };

  const reset = () => {
    x.set(0);
    controls.set({ x: 0 });
  };

  return {
    motionProps: {
      animate: controls,
      drag: "x" as const,
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 1,
      onDragEnd: handleDragEnd,
      style: { touchAction: "none", x }
    },
    ref,
    reset
  };
};

export default useSwipeToDismiss;

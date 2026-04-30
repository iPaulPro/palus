import {
  type PanInfo,
  useAnimation,
  useDragControls,
  useMotionValue
} from "motion/react";
import { useRef } from "react";

const LOCK_THRESHOLD = 6; // px of movement before axis is locked

export enum SwipeDirection {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  DOWN = "DOWN"
}

const defaultOptions = {
  directions: [SwipeDirection.LEFT, SwipeDirection.RIGHT] as SwipeDirection[],
  dismissThreshold: 0.35,
  handleOnly: false,
  snapbackDuration: 0.1,
  snapbackEasing: "easeOut"
};

const useSwipeToDismiss = (
  options: {
    /** Which directions trigger a dismiss. Default: LEFT and RIGHT */
    directions?: SwipeDirection[];

    /** Fraction of element dimension at which dismiss fires (0–1). Default 0.35 */
    dismissThreshold?: number;

    /**
     * When true, drag can only be initiated from a <SwipeToDismiss.Handle>.
     * Use this when the Target contains scrollable content to prevent iOS Safari
     * from cancelling the drag gesture mid-swipe. Default: false
     */
    handleOnly?: boolean;

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
  const {
    directions,
    dismissThreshold,
    handleOnly,
    onDismiss,
    onDismissEnd,
    snapbackDuration
  } = {
    ...defaultOptions,
    ...options
  };

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const lockedAxis = useRef<"x" | "y" | null>(null);

  const hasX = directions.some(
    (d) => d === SwipeDirection.LEFT || d === SwipeDirection.RIGHT
  );
  const hasY = directions.some(
    (d) => d === SwipeDirection.UP || d === SwipeDirection.DOWN
  );
  const hasLeft = directions.includes(SwipeDirection.LEFT);
  const hasRight = directions.includes(SwipeDirection.RIGHT);
  const hasUp = directions.includes(SwipeDirection.UP);
  const hasDown = directions.includes(SwipeDirection.DOWN);

  const dragAxis: boolean | "x" | "y" = hasX && hasY ? true : hasY ? "y" : "x";
  const dragElastic = {
    bottom: hasDown ? 1 : 0,
    left: hasLeft ? 1 : 0,
    right: hasRight ? 1 : 0,
    top: hasUp ? 1 : 0
  };

  const handleDragStart = () => {
    lockedAxis.current = null;
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (!hasX || !hasY) return; // single-axis drag already handled by `drag` prop
    if (lockedAxis.current !== null) {
      if (lockedAxis.current === "x") y.set(0);
      else x.set(0);
      return;
    }
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);
    if (absX >= LOCK_THRESHOLD || absY >= LOCK_THRESHOLD) {
      lockedAxis.current = absX >= absY ? "x" : "y";
    }
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const el = ref.current;
    const width = el?.offsetWidth ?? 300;
    const height = el?.offsetHeight ?? 600;

    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);

    let dismissed = false;

    if (hasX && (!hasY || absX >= absY)) {
      const direction =
        info.offset.x > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
      if (directions.includes(direction) && absX > width * dismissThreshold) {
        const sign = info.offset.x > 0 ? 1 : -1;
        onDismiss?.();
        await controls.start({
          transition: { duration: snapbackDuration },
          x: sign * width * 2
        });
        onDismissEnd?.();
        dismissed = true;
      }
    } else if (hasY) {
      const direction =
        info.offset.y > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
      if (directions.includes(direction) && absY > height * dismissThreshold) {
        const sign = info.offset.y > 0 ? 1 : -1;
        onDismiss?.();
        await controls.start({
          transition: { duration: snapbackDuration },
          y: sign * height * 2
        });
        onDismissEnd?.();
        dismissed = true;
      }
    }

    if (!dismissed) {
      await controls.start({
        transition: { duration: snapbackDuration },
        x: 0,
        y: 0
      });
    }
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    lockedAxis.current = null;
    controls.set({ x: 0, y: 0 });
  };

  return {
    dragControls,
    motionProps: {
      animate: controls,
      drag: dragAxis as boolean | "x" | "y",
      dragConstraints: { bottom: 0, left: 0, right: 0, top: 0 },
      dragControls,
      dragElastic,
      dragListener: !handleOnly,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      onDragStart: handleDragStart,
      style: { touchAction: "none", x, y }
    },
    ref,
    reset
  };
};

export default useSwipeToDismiss;

import { m } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createContext, use, useMemo } from "react";
import useSwipeToDismiss, { SwipeDirection } from "@/hooks/useSwipeToDismiss";

export { SwipeDirection };

type SwipeToDismissOptions = Parameters<typeof useSwipeToDismiss>[0];

interface SwipeToDismissContextValue {
  dragControls: ReturnType<typeof useSwipeToDismiss>["dragControls"];
  motionProps: ReturnType<typeof useSwipeToDismiss>["motionProps"];
  ref: ReturnType<typeof useSwipeToDismiss>["ref"];
  reset: ReturnType<typeof useSwipeToDismiss>["reset"];
}

const SwipeToDismissContext = createContext<SwipeToDismissContextValue | null>(
  null
);

function useSwipeToDismissContext() {
  const context = use(SwipeToDismissContext);
  if (!context) {
    throw new Error(
      "SwipeToDismiss compound components cannot be rendered outside the SwipeToDismiss component"
    );
  }
  return context;
}

function SwipeToDismiss({
  children,
  ...options
}: SwipeToDismissOptions & { children: ReactNode }) {
  const { ref, motionProps, reset, dragControls } = useSwipeToDismiss(options);
  const value = useMemo(
    () => ({ dragControls, motionProps, ref, reset }),
    [dragControls, motionProps, ref, reset]
  );

  return (
    <SwipeToDismissContext.Provider value={value}>
      {children}
    </SwipeToDismissContext.Provider>
  );
}

function Target({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof m.div>) {
  const { ref, motionProps } = useSwipeToDismissContext();

  return (
    <m.div ref={ref} {...motionProps} {...props}>
      {children}
    </m.div>
  );
}

/**
 * An area that initiates the drag gesture on pointer-down.
 * Use with `handleOnly` on the parent to prevent iOS Safari from cancelling
 * drags when the Target contains scrollable content.
 */
function Handle({
  children,
  style,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const { dragControls } = useSwipeToDismissContext();

  return (
    <div
      onPointerDown={(e) => dragControls.start(e)}
      style={{ touchAction: "none", ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

SwipeToDismiss.Handle = Handle;
SwipeToDismiss.Target = Target;

export { SwipeToDismiss };

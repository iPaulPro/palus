import { motion } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import useSwipeToDismiss from "@/hooks/useSwipeToDismiss";

type SwipeToDismissOptions = Parameters<typeof useSwipeToDismiss>[0];

interface SwipeToDismissContextValue {
  motionProps: ReturnType<typeof useSwipeToDismiss>["motionProps"];
  ref: ReturnType<typeof useSwipeToDismiss>["ref"];
  reset: ReturnType<typeof useSwipeToDismiss>["reset"];
}

const SwipeToDismissContext = createContext<SwipeToDismissContextValue | null>(
  null
);

function useSwipeToDismissContext() {
  const context = useContext(SwipeToDismissContext);
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
  const { ref, motionProps, reset } = useSwipeToDismiss(options);
  const value = useMemo(
    () => ({ motionProps, ref, reset }),
    [motionProps, ref, reset]
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
}: ComponentPropsWithoutRef<typeof motion.div>) {
  const { ref, motionProps } = useSwipeToDismissContext();

  return (
    <motion.div ref={ref} {...motionProps} {...props}>
      {children}
    </motion.div>
  );
}

SwipeToDismiss.Target = Target;

export { SwipeToDismiss };

import * as RadixTooltip from "@radix-ui/react-tooltip";
import { useMediaQuery } from "@uidotdev/usehooks";
import { motion } from "motion/react";
import { memo, type ReactNode, useCallback, useState } from "react";
import { IS_MOBILE } from "@/helpers/mediaQueries";

interface TooltipProps {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  placement?: "bottom" | "left" | "right" | "top";
  withDelay?: boolean;
}

const Tooltip = ({
  children,
  className = "",
  content,
  placement = "right",
  withDelay = false
}: TooltipProps) => {
  const isMobile = useMediaQuery(IS_MOBILE);
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(() => {
    if (isMobile) setOpen((prev) => !prev);
  }, [isMobile]);

  // Close on outside pointer-down when on mobile
  const handleContentPointerDownOutside = useCallback(() => {
    if (isMobile) setOpen(false);
  }, [isMobile]);

  return (
    <RadixTooltip.Provider
      delayDuration={withDelay ? 600 : 0}
      skipDelayDuration={withDelay ? 0 : 600}
    >
      <RadixTooltip.Root
        onOpenChange={isMobile ? setOpen : undefined}
        open={isMobile ? open : undefined}
      >
        <RadixTooltip.Trigger asChild>
          <span className={className} onClick={handleTriggerClick}>
            {children}
          </span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            asChild
            className="!rounded-lg !text-xs !leading-6 z-10 max-w-96 bg-gray-700 px-3 py-0.5 text-white tracking-wide"
            onPointerDownOutside={handleContentPointerDownOutside}
            side={placement}
            sideOffset={5}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <span>{content}</span>
              <RadixTooltip.Arrow className="fill-gray-700" />
            </motion.div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default memo(Tooltip);

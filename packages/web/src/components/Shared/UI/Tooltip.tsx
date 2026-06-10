import * as RadixTooltip from "@radix-ui/react-tooltip";
import { useMediaQuery } from "@uidotdev/usehooks";
import { m } from "motion/react";
import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type ReactNode,
  useCallback,
  useState
} from "react";
import cn from "@/helpers/cn";
import { IS_MOBILE } from "@/helpers/mediaQueries";

interface TooltipProps {
  children: ReactNode;
  className?: string;
  content: ReactNode | string;
  placement?: "bottom" | "left" | "right" | "top";
  withDelay?: boolean;
  showOnClick?: boolean;
}

const Tooltip = ({
  children,
  className = "",
  content,
  placement = "right",
  withDelay = false,
  showOnClick = false
}: TooltipProps) => {
  const isMobile = useMediaQuery(IS_MOBILE);
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(
    (e: MouseEvent<Element> | KeyboardEvent<Element>) => {
      if (isMobile && showOnClick) {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }
    },
    [isMobile, showOnClick]
  );

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
        <RadixTooltip.Trigger
          asChild
          className={className}
          onClick={handleTriggerClick}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleTriggerClick(e)
          }
        >
          <span>{children}</span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            asChild
            className={cn(
              "max-w-96 rounded-lg! bg-gray-700 px-4 py-3 text-white text-xs! leading-6! tracking-wide",
              {
                "px-3 py-1": typeof content === "string" && content.length < 50
              }
            )}
            onPointerDownOutside={handleContentPointerDownOutside}
            side={placement}
            sideOffset={5}
          >
            <m.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <span>{content}</span>
              <RadixTooltip.Arrow className="fill-gray-700" />
            </m.div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default memo(Tooltip);

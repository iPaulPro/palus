import { InformationCircleIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { memo } from "react";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface HelpTooltipProps {
  children: ReactNode;
  className?: string;
}

const HelpTooltip = ({ children, className = "" }: HelpTooltipProps) => {
  if (!children) {
    return null;
  }

  return (
    <span className={cn("cursor-pointer", className)}>
      <Tooltip content={<span>{children}</span>} placement="top" showOnClick>
        <InformationCircleIcon className="size-3.75 text-gray-500 dark:text-gray-200" />
      </Tooltip>
    </span>
  );
};

export default memo(HelpTooltip);

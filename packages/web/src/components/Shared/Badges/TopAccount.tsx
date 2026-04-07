import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { memo } from "react";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface TopAccountProps {
  className?: string;
}

const TopAccount = ({ className }: TopAccountProps) => {
  return (
    <Tooltip content="Top account" placement={"top"}>
      <CheckBadgeIcon
        className={cn(
          "size-5 flex-none text-green-600 dark:text-green-400",
          className
        )}
      />
    </Tooltip>
  );
};

export default memo(TopAccount);

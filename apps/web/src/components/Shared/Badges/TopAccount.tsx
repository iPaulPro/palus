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
        className={cn("size-5 flex-none text-[#0071A4]", className)}
      />
    </Tooltip>
  );
};

export default memo(TopAccount);

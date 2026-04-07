import type { ReactNode } from "react";
import { Toggle } from "@/components/Shared/UI";

interface ToggleWithHelperProps {
  description?: ReactNode;
  disabled?: boolean;
  heading?: ReactNode;
  icon?: ReactNode;
  on: boolean;
  setOn: (on: boolean) => void;
}

const ToggleWithHelper = ({
  description,
  disabled = false,
  heading,
  icon,
  on,
  setOn
}: ToggleWithHelperProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4">
      <div className="flex items-start space-x-3">
        {icon && <span className="mt-1">{icon}</span>}
        <div>
          {heading && <b>{heading}</b>}
          {description && (
            <div className="text-gray-500 text-sm dark:text-gray-200">
              {description}
            </div>
          )}
        </div>
      </div>
      <Toggle disabled={disabled} on={on} setOn={setOn} />
    </div>
  );
};

export default ToggleWithHelper;

import type { ReactNode } from "react";
import { memo } from "react";
import { H5 } from "./Typography";

interface CardHeaderProps {
  body?: ReactNode;
  icon?: ReactNode;
  hideDivider?: boolean;
  title: ReactNode;
}

const CardHeader = ({
  body,
  icon,
  hideDivider = false,
  title
}: CardHeaderProps) => {
  return (
    <>
      <div className="mx-4 my-3 space-y-2 sm:mx-6">
        <div className="flex items-center gap-x-4">
          {icon ? icon : null}
          <H5>{title}</H5>
        </div>
        {body ? <p>{body}</p> : null}
      </div>
      {hideDivider ? null : <div className="divider" />}
    </>
  );
};

export default memo(CardHeader);

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, m } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import Timestamp from "./Timestamp";

interface ExpandableNotificationProps {
  icon: ReactNode;
  avatars: ReactNode;
  isNew: boolean;
  title: ReactNode;
  preview?: ReactNode;
  children?: ReactNode;
  expandable?: boolean;
  timestamp?: string;
}

const ExpandableNotification = ({
  icon,
  avatars,
  isNew,
  title,
  preview,
  children,
  expandable = true,
  timestamp
}: ExpandableNotificationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRef = useRef(false);

  const toggle = () => {
    const next = !isExpanded;
    expandedRef.current = next;
    setIsExpanded(next);
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-3">
        {icon}
        <div className="flex items-center gap-x-1">{avatars}</div>
      </div>
      <div className="flex items-center gap-x-2">
        {expandable ? (
          <>
            {isNew ? (
              <div className="size-2 rounded-full bg-brand-500" />
            ) : null}
            <button
              aria-label={isExpanded ? "Collapse" : "Expand"}
              className="cursor-pointer p-0.5 text-secondary transition-colors hover:text-black dark:hover:text-white"
              onClick={toggle}
              type="button"
            >
              <m.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="size-4" />
              </m.div>
            </button>
          </>
        ) : timestamp ? (
          <Timestamp isNew={isNew} timestamp={timestamp} />
        ) : isNew ? (
          <div className="size-2 rounded-full bg-brand-500" />
        ) : null}
      </div>
    </div>
  );

  const body = (
    <div className="ml-9">
      {title}
      {preview}
    </div>
  );

  if (!expandable) {
    return (
      <div className="space-y-2 px-4 py-5 md:p-5">
        {header}
        {body}
      </div>
    );
  }

  return (
    <button
      className="w-full space-y-2 px-4 py-5 text-left md:p-5"
      onClick={toggle}
      type="button"
    >
      {header}
      {body}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.div
            animate={{ height: "auto", opacity: 1 }}
            className="ml-9 overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="space-y-2 pt-2">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ExpandableNotification;

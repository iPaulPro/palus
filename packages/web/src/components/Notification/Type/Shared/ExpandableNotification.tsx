import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { m } from "motion/react";
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

interface HeaderProps {
  icon: ReactNode;
  avatars: ReactNode;
  isNew: boolean;
  expandable: boolean;
  isExpanded: boolean;
  timestamp?: string;
  onToggle: () => void;
}

const Header = ({
  icon,
  avatars,
  isNew,
  expandable,
  isExpanded,
  timestamp,
  onToggle
}: HeaderProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-x-3">
      {icon}
      <div className="flex items-center gap-x-1">{avatars}</div>
    </div>
    <div className="flex items-center gap-x-2">
      {expandable ? (
        <>
          {isNew ? <div className="size-2 rounded-full bg-brand-500" /> : null}
          <button
            aria-label={isExpanded ? "Collapse" : "Expand"}
            className="cursor-pointer p-0.5 text-secondary transition-colors hover:text-black dark:hover:text-white"
            onClick={onToggle}
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

interface BodyProps {
  title: ReactNode;
  preview?: ReactNode;
}

const Body = ({ title, preview }: BodyProps) => (
  <div className="ml-9">
    {title}
    {preview}
  </div>
);

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
  const contentRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
  };

  if (!expandable) {
    return (
      <div className="space-y-2 px-4 py-5 md:p-5">
        <Header
          avatars={avatars}
          expandable={false}
          icon={icon}
          isExpanded={false}
          isNew={isNew}
          onToggle={toggle}
          timestamp={timestamp}
        />
        <Body preview={preview} title={title} />
      </div>
    );
  }

  return (
    <button
      className="w-full space-y-2 px-4 py-5 text-left md:p-5"
      onClick={toggle}
      type="button"
    >
      <Header
        avatars={avatars}
        expandable={true}
        icon={icon}
        isExpanded={isExpanded}
        isNew={isNew}
        onToggle={toggle}
        timestamp={timestamp}
      />
      <Body preview={preview} title={title} />
      <m.div
        animate={{
          height: isExpanded ? (contentRef.current?.scrollHeight ?? 0) : 0,
          opacity: isExpanded ? 1 : 0
        }}
        className="ml-9 overflow-hidden"
        initial={false}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="space-y-2 pt-2" ref={contentRef}>
          {children}
        </div>
      </m.div>
    </button>
  );
};

export default ExpandableNotification;

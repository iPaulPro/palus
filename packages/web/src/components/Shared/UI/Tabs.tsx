import { useIntersectionObserver } from "@uidotdev/usehooks";
import { MotionConfig, motion } from "motion/react";
import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type ReactNode,
  useLayoutEffect,
  useRef
} from "react";
import cn from "@/helpers/cn";

interface TabsProps {
  tabs: { name: string; type: string; suffix?: ReactNode }[];
  active: string;
  setActive: (type: string) => void;
  layoutId: string;
  className?: string;
}

const Tabs = ({ tabs, active, setActive, layoutId, className }: TabsProps) => {
  const tabRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const [ref, entry] = useIntersectionObserver();

  useLayoutEffect(() => {
    const activeTab = tabRefs.current.get(active);
    if (activeTab && entry?.isIntersecting) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [active, entry?.isIntersecting]);

  const handleAction = (
    e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>,
    type: string
  ) => {
    if ("key" in e && e.key !== "Enter" && e.key !== " ") return;
    setActive(type);
  };

  return (
    <div className="no-scrollbar w-full min-w-0 overflow-scroll">
      <MotionConfig transition={{ bounce: 0, duration: 0.4, type: "spring" }}>
        <motion.ul
          className={cn(
            "mb-0 grid min-w-full list-none auto-cols-max grid-flow-col gap-2 px-4 md:px-0",
            className
          )}
          layout
          ref={ref}
        >
          {tabs.map((tab) => (
            <motion.li
              className="relative flex-none cursor-pointer px-3 py-1.5 text-sm outline-hidden transition-colors"
              key={tab.type}
              layout
              onClick={(e) => handleAction(e, tab.type)}
              onKeyDown={(e) => handleAction(e, tab.type)}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(tab.type, el);
                } else {
                  tabRefs.current.delete(tab.type);
                }
              }}
              tabIndex={0}
            >
              {active === tab.type ? (
                <motion.div
                  className="absolute inset-0 rounded-lg border border-border bg-card"
                  layoutId={layoutId}
                />
              ) : null}
              <span
                className={cn("relative flex items-center gap-2 text-inherit", {
                  "text-secondary": active !== tab.type
                })}
              >
                {tab.name}
                {tab.suffix}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </MotionConfig>
    </div>
  );
};

export default memo(Tabs);

import { MotionConfig, motion } from "motion/react";
import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type ReactNode,
  useEffect,
  useRef
} from "react";
import { ScrollArea } from "@/components/Shared/UI/ScrollArea";
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

  useEffect(() => {
    const activeTab = tabRefs.current.get(active);
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [active]);

  const handleAction = (
    e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>,
    type: string
  ) => {
    if ("key" in e && e.key !== "Enter" && e.key !== " ") return;
    setActive(type);
  };

  return (
    <ScrollArea className="w-full min-w-0">
      <MotionConfig transition={{ bounce: 0, duration: 0.4, type: "spring" }}>
        <motion.ul
          className={cn(
            "mb-0 grid min-w-full list-none auto-cols-max grid-flow-col gap-2 px-5 md:px-0",
            className
          )}
          layout
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
                  className="absolute inset-0 rounded-lg bg-gray-300 dark:bg-gray-300/20"
                  layoutId={layoutId}
                />
              ) : null}
              <span className="relative flex items-center gap-2 text-inherit">
                {tab.name}
                {tab.suffix}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </MotionConfig>
    </ScrollArea>
  );
};

export default memo(Tabs);

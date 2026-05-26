import { useIntersectionObserver } from "@uidotdev/usehooks";
import {
  Children,
  type CSSProperties,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

const marqueeContainerStyles: CSSProperties = {
  overflow: "hidden",
  position: "relative",
  width: "100%"
};

interface MarqueeTextProps {
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "left" | "right";
  textSpacing?: string;
  pauseOnHover?: boolean;
  playOnlyInView?: boolean;
  threshold?: number;
}

const marqueeBaseStyles: CSSProperties = {
  display: "inline-block",
  whiteSpace: "nowrap"
};

const marqueeItemsStyles = (
  startPosition: number,
  time: number,
  direction?: string,
  delay?: number,
  willChange?: boolean
): CSSProperties => ({
  ...marqueeBaseStyles,
  animationDelay: delay ? `${delay}ms` : undefined,
  animationDirection: direction === "left" ? "reverse" : undefined,
  animationDuration: `${time}s`,
  animationIterationCount: "infinite",
  animationName: "marqueeScroll",
  animationPlayState: "var(--marquee-play)",
  animationTimingFunction: "linear",
  transform: `translate3d(-${startPosition}px, 0, 0)`,
  ...(willChange && { willChange: "transform" })
});

const marqueeItemStyles = (marginRight: string): CSSProperties => ({
  display: "inline-block",
  marginRight: marginRight,
  position: "relative"
});

const getClonedItems = (
  items: (string | number | ReactNode)[],
  copyTimes = 1
): (string | number)[] => {
  return Array(copyTimes).fill(items).flat();
};

const MarqueeText: FC<MarqueeTextProps> = ({
  className = "marquee",
  delay = 3000,
  duration = 10,
  direction = "left",
  pauseOnHover = true,
  playOnlyInView = true,
  textSpacing = "2em",
  threshold = 1,
  children
}: MarqueeTextProps) => {
  const marqueeItems = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateFrom, setTranslateFrom] = useState(0);
  const [showItems, setShowItems] = useState(() => Children.toArray(children));
  const [initialDuration, setInitialDuration] = useState(() => duration);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const [intersectionRef, entry] = useIntersectionObserver({
    root: null,
    rootMargin: "10px",
    threshold
  });

  const computeLayout = useCallback(() => {
    const element = marqueeItems.current;
    const measureElement = measureRef.current;
    if (!element || !measureElement) return;

    const originalItems = Children.toArray(children);
    const containerWidth = Math.floor(element.parentElement?.offsetWidth ?? 0);

    // Always measure the hidden single-copy element so clones never inflate the width
    const itemsWidth = Math.floor(measureElement.scrollWidth);

    if (itemsWidth <= containerWidth || containerWidth === 0) {
      setIsOverflowing(false);
      setShowItems(originalItems);
      return;
    }

    setIsOverflowing(true);
    const cloneTimes = Math.max(
      2,
      Math.ceil((containerWidth * 2) / itemsWidth)
    );
    const translateFromVal = itemsWidth * Math.floor(cloneTimes / 2);
    const durationVal =
      duration *
      Number.parseFloat((translateFromVal / containerWidth).toFixed(2));

    setShowItems(getClonedItems(originalItems, cloneTimes));
    setTranslateFrom(translateFromVal);
    setInitialDuration(durationVal);
  }, [children, duration]);

  // Recompute on children/duration change
  useEffect(() => {
    computeLayout();
  }, [computeLayout]);

  // Recompute on container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      computeLayout();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [computeLayout]);

  useEffect(() => {
    if (!playOnlyInView) return;

    if (entry?.isIntersecting) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [entry, playOnlyInView]);

  // Attach both the intersection observer ref and the container ref to the same element
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      intersectionRef(node);
    },
    [intersectionRef]
  );

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={setRefs}
      style={
        isOverflowing
          ? {
              ...marqueeContainerStyles,
              ["--marquee-play" as string]: isPlaying ? "running" : "paused"
            }
          : marqueeContainerStyles
      }
    >
      {/* Hidden measurement element — always holds original children only, never clones */}
      <div
        aria-hidden="true"
        ref={measureRef}
        style={{
          ...marqueeBaseStyles,
          pointerEvents: "none",
          position: "absolute",
          visibility: "hidden"
        }}
      >
        {children}
      </div>
      <div
        className={`${className}__items`}
        ref={marqueeItems}
        style={
          isOverflowing
            ? marqueeItemsStyles(
                translateFrom,
                initialDuration,
                direction,
                delay
              )
            : marqueeBaseStyles
        }
      >
        {showItems.map((item, index) => {
          return (
            <>
              {/* react-doctor-disable-next-line react-doctor/no-array-index-as-key */}
              <div
                className={`${className}__item`}
                key={index}
                style={marqueeItemStyles(textSpacing)}
              >
                {item}
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default MarqueeText;

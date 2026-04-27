import {
  forwardRef,
  type ReactNode,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef
} from "react";
import { useNavigationType } from "react-router";
import {
  type CacheSnapshot,
  WindowVirtualizer,
  type WindowVirtualizerHandle
} from "virtua";

interface CachedWindowVirtualizerProps {
  cacheKey: string;
  children: ReactNode;
  onScroll?: (scrollOffset: number) => void;
  alwaysRestore?: boolean;
}

// Track which keys have been "cleared" during this JS session to allow
// restoration after subsequent SPA navigations even if the initial load was a reload.
const sessionHandledKeys = new Set<string>();

// Track which keys have already had scroll restoration performed this session,
// so that remounting the component (e.g. after a comment is posted and the feed
// transitions from empty → populated) does not re-trigger a scroll-to-top.
const restoredKeys = new Set<string>();

const CachedWindowVirtualizer = forwardRef<
  WindowVirtualizerHandle,
  CachedWindowVirtualizerProps
>(({ cacheKey, children, onScroll, alwaysRestore = false }, ref) => {
  const innerRef = useRef<WindowVirtualizerHandle>(null);
  const navType = useNavigationType();
  const shouldRestore = alwaysRestore || navType === "POP";

  useImperativeHandle(ref, () => innerRef.current as WindowVirtualizerHandle);

  const [offset, cache] = useMemo(() => {
    // Check if the page was refreshed
    const navigation =
      typeof window === "undefined"
        ? null
        : (performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming);
    const isReload = navigation?.type === "reload";

    if (isReload && !sessionHandledKeys.has(cacheKey)) {
      sessionHandledKeys.add(cacheKey);
      return [0, undefined] as [number, CacheSnapshot | undefined];
    }

    const serialized = sessionStorage.getItem(cacheKey);
    if (!serialized)
      return [0, undefined] as [number, CacheSnapshot | undefined];
    try {
      return JSON.parse(serialized) as [number, CacheSnapshot];
    } catch {
      return [0, undefined] as [number, CacheSnapshot | undefined];
    }
  }, [cacheKey]);

  useLayoutEffect(() => {
    const handle = innerRef.current;
    if (!handle) return;

    if (!restoredKeys.has(cacheKey) && shouldRestore) {
      window.scrollTo(0, offset);
      restoredKeys.add(cacheKey);
    }

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      sessionStorage.setItem(cacheKey, JSON.stringify([scrollY, handle.cache]));
      restoredKeys.delete(cacheKey);
    };
  }, [cacheKey, offset, shouldRestore]);

  return (
    <WindowVirtualizer
      cache={cache}
      onScroll={() => onScroll?.(innerRef.current?.scrollOffset ?? 0)}
      ref={innerRef}
    >
      {children}
    </WindowVirtualizer>
  );
});

export default CachedWindowVirtualizer;

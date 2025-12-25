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
  onRefresh?: () => Promise<any>;
}

// Track which keys have been "cleared" during this JS session to allow
// restoration after subsequent SPA navigations even if the initial load was a reload.
const sessionHandledKeys = new Set<string>();

const CachedWindowVirtualizer = forwardRef<
  WindowVirtualizerHandle,
  CachedWindowVirtualizerProps
>(({ cacheKey, children, onRefresh }, ref) => {
  const innerRef = useRef<WindowVirtualizerHandle>(null);
  const isRestored = useRef(false);
  const navType = useNavigationType();
  const shouldRestore = navType === "POP";

  useImperativeHandle(ref, () => innerRef.current as WindowVirtualizerHandle);

  const [offset, cache] = useMemo(() => {
    // Check if the page was refreshed
    const navigation =
      typeof window !== "undefined"
        ? (performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming)
        : null;
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

  // Reset restoration flag if the cacheKey changes (e.g., switching feeds)
  const lastKey = useRef(cacheKey);
  if (lastKey.current !== cacheKey) {
    isRestored.current = false;
    lastKey.current = cacheKey;
  }

  useLayoutEffect(() => {
    const handle = innerRef.current;
    if (!handle) return;

    if (!isRestored.current && shouldRestore) {
      window.scrollTo(0, offset);
      isRestored.current = true;
    }

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      sessionStorage.setItem(cacheKey, JSON.stringify([scrollY, handle.cache]));
    };
  }, [cacheKey, offset, shouldRestore]);

  return (
    <div className="virtual-divider-list-window">
      <WindowVirtualizer cache={cache} ref={innerRef}>
        {children}
      </WindowVirtualizer>
    </div>
  );
});

export default CachedWindowVirtualizer;

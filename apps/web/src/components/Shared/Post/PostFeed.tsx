import { memo, type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import {
  type CacheSnapshot,
  WindowVirtualizer,
  type WindowVirtualizerHandle
} from "virtua";
import PostsShimmer from "@/components/Shared/Shimmer/PostsShimmer";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";

interface PostFeedProps<T extends { id: string }> {
  items: T[];
  loading?: boolean;
  error?: { message?: string };
  hasMore?: boolean;
  handleEndReached: () => Promise<void>;
  emptyIcon: ReactNode;
  emptyMessage: ReactNode;
  errorTitle: string;
  renderItem: (item: T) => ReactNode;
}

const PostFeed = <T extends { id: string }>({
  items,
  loading = false,
  error,
  hasMore,
  handleEndReached,
  emptyIcon,
  emptyMessage,
  errorTitle,
  renderItem
}: PostFeedProps<T>) => {
  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  const cacheKey = "window-list-cache-post-feed";
  const ref = useRef<WindowVirtualizerHandle>(null);

  const [offset, cache] = useMemo(() => {
    const serialized = sessionStorage.getItem(cacheKey);
    if (!serialized) return [];
    try {
      return JSON.parse(serialized) as [number, CacheSnapshot];
    } catch {
      return [];
    }
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const handle = ref.current;

    window.scrollTo(0, offset ?? 0);

    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      // Use stored window.scrollY because it may return 0 in useEffect cleanup
      sessionStorage.setItem(cacheKey, JSON.stringify([scrollY, handle.cache]));
    };
  }, []);

  if (loading) {
    return <PostsShimmer />;
  }

  if (!items?.length) {
    return <EmptyState icon={emptyIcon} message={emptyMessage} />;
  }

  if (error) {
    return <ErrorMessage error={error} title={errorTitle} />;
  }

  return (
    <Card className="virtual-divider-list-window">
      <WindowVirtualizer cache={cache} ref={ref}>
        {items.map((item) => renderItem(item))}
        {hasMore && <span ref={loadMoreRef} />}
      </WindowVirtualizer>
    </Card>
  );
};

export default memo(PostFeed) as typeof PostFeed;

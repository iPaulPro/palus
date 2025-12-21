import { memo, type ReactNode, useRef } from "react";
import type { WindowVirtualizerHandle } from "virtua";
import CachedWindowVirtualizer from "@/components/Shared/CachedWindowVirtualizer";
import PostsShimmer from "@/components/Shared/Shimmer/PostsShimmer";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";

interface PostFeedProps<T extends { id: string }> {
  items: T[];
  kind:
    | "account"
    | "bookmarks"
    | "comment"
    | "none-relevant"
    | "explore"
    | "group"
    | "for-you"
    | "highlights"
    | "timeline"
    | "search";
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
  kind,
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

  const cacheKey = `window-list-cache-${kind}`;
  const ref = useRef<WindowVirtualizerHandle>(null);

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
      <CachedWindowVirtualizer cacheKey={cacheKey} ref={ref}>
        {items.map((item) => renderItem(item))}
        {hasMore && <span ref={loadMoreRef} />}
      </CachedWindowVirtualizer>
    </Card>
  );
};

export default memo(PostFeed) as typeof PostFeed;

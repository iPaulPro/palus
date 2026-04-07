import { UserGroupIcon } from "@heroicons/react/24/outline";
import { type GroupsRequest, PageSize, useGroupsQuery } from "@palus/indexer";
import { useCallback, useRef } from "react";
import type { WindowVirtualizerHandle } from "virtua";
import SingleGroup from "@/components/Shared/Group/SingleGroup";
import SingleGroupShimmer from "@/components/Shared/Shimmer/SingleGroupShimmer";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import CachedWindowVirtualizer from "../Shared/CachedWindowVirtualizer";

interface GroupsProps {
  query: string;
}

const Groups = ({ query }: GroupsProps) => {
  const request: GroupsRequest = {
    filter: { searchQuery: query },
    pageSize: PageSize.Fifty
  };

  const { data, error, fetchMore, loading } = useGroupsQuery({
    skip: !query,
    variables: { request }
  });

  const groups = data?.groups?.items;
  const pageInfo = data?.groups?.pageInfo;
  const hasMore = pageInfo?.next;

  const cacheKey = "window-list-cache-group-search";
  const ref = useRef<WindowVirtualizerHandle>(null);

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <Card className="mb-5 p-5" key={i}>
            <SingleGroupShimmer isBig />
          </Card>
        ))}
      </>
    );
  }

  if (!groups?.length) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="size-8" />}
        message={
          <span>
            No groups for <b>&ldquo;{query}&rdquo;</b>
          </span>
        }
      />
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load groups" />;
  }

  return (
    <CachedWindowVirtualizer cacheKey={cacheKey} ref={ref}>
      {groups.map((group) => (
        <Card className="mb-5 p-5" key={group.address}>
          <SingleGroup group={group} isBig showDescription />
        </Card>
      ))}
      {hasMore && <div className="h-0.5" ref={loadMoreRef} />}
    </CachedWindowVirtualizer>
  );
};

export default Groups;

import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";

const useLoadMoreOnIntersect = (onLoadMore: () => Promise<void>) => {
  const [ref, entry] = useIntersectionObserver({
    root: null,
    rootMargin: "200px",
    threshold: 0
  });

  const isLoadingRef = useRef(false);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!entry?.isIntersecting || isLoadingRef.current) return;

    isLoadingRef.current = true;
    Promise.resolve(onLoadMoreRef.current()).finally(() => {
      isLoadingRef.current = false;
    });
  }, [entry]);

  return ref;
};

export default useLoadMoreOnIntersect;

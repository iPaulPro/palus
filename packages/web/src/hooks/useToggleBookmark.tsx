import type { ApolloCache, NormalizedCacheObject } from "@apollo/client";
import {
  type PostFragment,
  useBookmarkPostMutation,
  useUndoBookmarkPostMutation
} from "@palus/indexer";
import { useCallback, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import errorToast from "@/helpers/errorToast";
import type { ApolloClientError } from "@/types/errors";

interface BookmarkProps {
  post: PostFragment;
}

const useToggleBookmark = ({ post }: BookmarkProps) => {
  const { pathname } = useLocation();
  const hasBookmarked = post.operations?.hasBookmarked;
  const count = post.stats.bookmarks;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateCache = useCallback(
    (cache: ApolloCache<NormalizedCacheObject>, hasBookmarked: boolean) => {
      if (!post.operations) {
        return;
      }

      cache.modify({
        fields: { hasBookmarked: () => hasBookmarked },
        id: cache.identify(post.operations)
      });

      cache.modify({
        fields: {
          stats: (existingData) => ({
            ...existingData,
            bookmarks: hasBookmarked
              ? existingData.bookmarks + 1
              : existingData.bookmarks - 1
          })
        },
        id: cache.identify(post)
      });

      // Remove bookmarked post from bookmarks feed
      if (pathname === "/bookmarks") {
        cache.evict({ id: cache.identify(post) });
      }
    },
    [post, pathname]
  );

  const onError = useCallback((error: ApolloClientError) => {
    setIsLoading(false);
    errorToast(error);
  }, []);

  const onCompleted = useCallback((added: boolean) => {
    toast.success(added ? "Post bookmarked!" : "Removed post bookmark!");
    setIsLoading(false);
  }, []);

  const [bookmarkPost] = useBookmarkPostMutation({
    onCompleted: () => onCompleted(true),
    onError,
    update: (cache) => updateCache(cache, true),
    variables: { request: { post: post.id } }
  });

  const [undoBookmarkPost] = useUndoBookmarkPostMutation({
    onCompleted: () => onCompleted(false),
    onError,
    update: (cache) => updateCache(cache, false),
    variables: { request: { post: post.id } }
  });

  const toggleBookmark = useCallback(async () => {
    setIsLoading(true);

    if (hasBookmarked) {
      return undoBookmarkPost();
    }

    return bookmarkPost();
  }, [hasBookmarked, undoBookmarkPost, bookmarkPost]);

  return { count, hasBookmarked, isLoading, toggleBookmark };
};

export default useToggleBookmark;

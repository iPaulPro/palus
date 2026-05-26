import type { ApolloCache, NormalizedCacheObject } from "@apollo/client";
import {
  type PostFragment,
  useBookmarkPostMutation,
  useUndoBookmarkPostMutation
} from "@palus/indexer";
import { useCounter, useToggle } from "@uidotdev/usehooks";
import { useCallback } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { ERRORS } from "@/data/errors";
import errorToast from "@/helpers/errorToast";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

interface BookmarkProps {
  post: PostFragment;
  showToast?: boolean;
}

const useToggleBookmark = ({ post, showToast = false }: BookmarkProps) => {
  const { currentAccount } = useAccountStore();
  const { pathname } = useLocation();
  const [hasBookmarked, toggleHasBookmarked] = useToggle(
    post.operations?.hasBookmarked
  );
  const [count, { increment, decrement }] = useCounter(post.stats.bookmarks);

  const updateCache = useCallback(
    (cache: ApolloCache<NormalizedCacheObject>, added: boolean) => {
      if (!post.operations) {
        return;
      }

      cache.modify({
        fields: { hasBookmarked: () => added },
        id: cache.identify(post.operations)
      });

      cache.modify({
        fields: {
          stats: (existingData) => ({
            ...existingData,
            bookmarks: added
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

  const onError = useCallback(
    (error: ApolloClientError) => {
      toggleHasBookmarked();
      errorToast(error);
    },
    [toggleHasBookmarked]
  );

  const onCompleted = useCallback(
    (bookmarked: boolean) => {
      if (!showToast) return;
      toast.success(bookmarked ? "Post bookmarked!" : "Removed post bookmark");
    },
    [showToast]
  );

  const [bookmarkPost] = useBookmarkPostMutation({
    onCompleted: () => onCompleted(true),
    onError: (error) => {
      decrement();
      onError(error);
    },
    update: (cache) => updateCache(cache, true),
    variables: { request: { post: post.id } }
  });

  const [undoBookmarkPost] = useUndoBookmarkPostMutation({
    onCompleted: () => onCompleted(false),
    onError: (error) => {
      increment();
      onError(error);
    },
    update: (cache) => updateCache(cache, false),
    variables: { request: { post: post.id } }
  });

  const toggleBookmark = useCallback(async () => {
    if (!currentAccount) {
      return toast.error(ERRORS.LoginRequired);
    }

    toggleHasBookmarked();

    if (hasBookmarked) {
      decrement();
      return undoBookmarkPost();
    }

    increment();
    return bookmarkPost();
  }, [
    hasBookmarked,
    toggleHasBookmarked,
    increment,
    decrement,
    undoBookmarkPost,
    bookmarkPost,
    currentAccount
  ]);

  return { count, hasBookmarked, toggleBookmark };
};

export default useToggleBookmark;

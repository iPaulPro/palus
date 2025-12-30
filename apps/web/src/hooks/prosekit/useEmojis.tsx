import type { Emoji } from "@palus/types/misc";
import { useMemo } from "react";
import allEmojis from "../../assets/emoji.json";

const DEFAULT_MAX_EMOJI_COUNT = 5;

interface UseEmojisOptions {
  limit?: number;
  query?: string;
  minQueryLength?: number;
}

interface UseEmojisResult {
  emojis: Emoji[];
  allEmojis: Emoji[] | undefined;
}

const useEmojis = ({
  limit = DEFAULT_MAX_EMOJI_COUNT,
  query = "",
  minQueryLength = 0
}: UseEmojisOptions = {}): UseEmojisResult => {
  const emojis = useMemo(() => {
    if (!allEmojis) {
      return [];
    }

    if (!query || query.length < minQueryLength) {
      return allEmojis.slice(0, limit);
    }

    return allEmojis
      .filter((emoji) => {
        const lowercaseQuery = query.toLowerCase();
        return (
          emoji.aliases.some((alias) =>
            alias.toLowerCase().includes(lowercaseQuery)
          ) ||
          emoji.tags.some((tag) =>
            tag.toLowerCase().includes(lowercaseQuery)
          ) ||
          emoji.description.toLowerCase().includes(lowercaseQuery)
        );
      })
      .slice(0, limit);
  }, [query, allEmojis, limit, minQueryLength]);

  return {
    allEmojis,
    emojis
  };
};

export default useEmojis;

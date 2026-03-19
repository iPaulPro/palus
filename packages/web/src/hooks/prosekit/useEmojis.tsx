import { useEffect, useMemo, useState } from "react";
import type { Emoji } from "@/types/misc";

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
  const [allEmojis, setAllEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    import("@/assets/emoji.json").then((mod) => {
      setAllEmojis(mod.default);
    });
  }, []);

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
          emoji.a.some((alias) =>
            alias.toLowerCase().includes(lowercaseQuery)
          ) ||
          emoji.t?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
          emoji.d.toLowerCase().includes(lowercaseQuery)
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

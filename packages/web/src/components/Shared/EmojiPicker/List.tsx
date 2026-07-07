import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type ChangeEvent, type MouseEvent, useMemo, useState } from "react";
import { Virtualizer } from "virtua";
import { Input } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useEmojis from "@/hooks/prosekit/useEmojis";
import type { Emoji } from "@/types/misc";

interface ListProps {
  setEmoji: (emoji: string) => void;
}

const COLUMNS = 6;

const List = ({ setEmoji }: ListProps) => {
  const [searchText, setSearchText] = useState("");
  const { emojis } = useEmojis({
    limit: 2000, // Show more emojis in the picker
    minQueryLength: 2,
    query: searchText
  });

  const rows = useMemo(() => {
    const chunks: Emoji[][] = [];
    for (let i = 0; i < emojis.length; i += COLUMNS) {
      chunks.push(emojis.slice(i, i + COLUMNS));
    }
    return chunks;
  }, [emojis]);

  const handleClearSearch = (e: MouseEvent) => {
    e.preventDefault();
    stopEventPropagation(e);
    setSearchText("");
  };

  return (
    <div>
      <div className="w-full p-2 pt-4 pb-0">
        <Input
          className="px-3 py-2 text-base sm:text-sm"
          iconLeft={<MagnifyingGlassIcon />}
          iconRight={
            <XMarkIcon
              className={cn(
                "cursor-pointer",
                searchText ? "visible" : "invisible"
              )}
              onClick={handleClearSearch}
            />
          }
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setSearchText(event.target.value)
          }
          onClick={(e) => {
            e.preventDefault();
            stopEventPropagation(e);
          }}
          placeholder="Search..."
          type="text"
          value={searchText}
        />
      </div>
      <div className="max-h-40 overflow-y-auto p-2 pt-2">
        <Virtualizer>
          {rows.map((row) => (
            <div
              className="grid grid-cols-6"
              key={row.map((e) => e.e).join("")}
            >
              {row.map((emoji) => (
                <button
                  className="rounded-lg py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={emoji.e}
                  onClick={() => setEmoji(emoji.e)}
                  type="button"
                >
                  {emoji.e}
                </button>
              ))}
            </div>
          ))}
        </Virtualizer>
      </div>
    </div>
  );
};

export default List;

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Shared/UI";
import List from "./List";

interface EmojiPickerProps {
  emoji?: null | string;
  setEmoji: (emoji: string) => void;
  anchor?: "top start" | "bottom start";
}

const EmojiPicker = ({
  emoji,
  setEmoji,
  anchor = "bottom start"
}: EmojiPickerProps) => {
  return (
    <Tooltip content="Emoji" placement="top" withDelay>
      <Popover className="relative">
        <PopoverButton className="flex items-center">
          {emoji ? (
            <span className="text-lg">{emoji}</span>
          ) : (
            <FaceSmileIcon className="size-5" />
          )}
        </PopoverButton>
        <PopoverPanel
          anchor={anchor}
          className="flex w-[300px] flex-col rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
        >
          <List
            setEmoji={(emoji: string) => {
              setEmoji(emoji);
            }}
          />
        </PopoverPanel>
      </Popover>
    </Tooltip>
  );
};

export default EmojiPicker;

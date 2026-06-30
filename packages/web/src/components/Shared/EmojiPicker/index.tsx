import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Shared/UI";
import List from "./List";

interface EmojiPickerProps {
  setEmoji: (emoji: string) => void;
  anchor?: "top start" | "bottom start";
}

const EmojiPicker = ({
  setEmoji,
  anchor = "bottom start"
}: EmojiPickerProps) => {
  return (
    <Popover className="relative">
      <Tooltip content="Insert Emoji" placement="top" withDelay>
        <PopoverButton className="flex items-center">
          <FaceSmileIcon className="size-5" />
        </PopoverButton>
      </Tooltip>
      <PopoverPanel
        anchor={anchor}
        className="flex w-75 flex-col rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
      >
        <List
          setEmoji={(emoji: string) => {
            setEmoji(emoji);
          }}
        />
      </PopoverPanel>
    </Popover>
  );
};

export default EmojiPicker;

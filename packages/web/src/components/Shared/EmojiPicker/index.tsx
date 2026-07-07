import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { useClickAway } from "@uidotdev/usehooks";
import { type RefObject, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip
} from "@/components/Shared/UI";
import List from "./List";

interface EmojiPickerProps {
  setEmoji: (emoji: string) => void;
  align?: "start" | "center" | "end";
}

const EmojiPicker = ({ setEmoji, align = "center" }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const contentRef = useClickAway(() => {
    setOpen(false);
  }) as RefObject<HTMLDivElement>;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <Tooltip content="Insert Emoji" placement="top" withDelay>
        <PopoverTrigger className="flex items-center">
          <FaceSmileIcon className="size-5" />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        align={align}
        className="flex w-75 flex-col rounded-xl border border-gray-200 bg-white p-0 shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
        onCloseAutoFocus={(e) => e.preventDefault()}
        ref={contentRef}
      >
        <List
          setEmoji={(emoji: string) => {
            setEmoji(emoji);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;

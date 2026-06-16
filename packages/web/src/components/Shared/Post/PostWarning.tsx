import { memo } from "react";
import { Button, Card } from "@/components/Shared/UI";

interface PostWarningProps {
  message: string;
  setIgnore: (ignore: boolean) => void;
}

const PostWarning = ({ message, setIgnore }: PostWarningProps) => {
  return (
    <Card
      className="!bg-gray-100 dark:!bg-gray-800 m-5 flex flex-row items-center justify-between gap-3 px-3 py-2"
      forceRounded
    >
      <div className="truncate text-sm">{message}</div>
      <Button
        className="shrink-0"
        onClick={() => setIgnore(true)}
        size="sm"
        variant="outline"
      >
        Show post
      </Button>
    </Card>
  );
};

export default memo(PostWarning);

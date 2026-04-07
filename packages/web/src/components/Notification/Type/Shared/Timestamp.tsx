import dayjs from "dayjs";
import { Tooltip } from "@/components/Shared/UI";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";

interface Props {
  timestamp: string;
  isNew: boolean;
}

const Timestamp = ({ timestamp, isNew }: Props) => {
  return (
    <div className="flex items-center gap-x-2">
      {isNew ? <div className="size-2 rounded-full bg-brand-500" /> : null}
      <Tooltip
        content={dayjs(timestamp).format("MMM D, YYYY h:mm A")}
        placement="left"
      >
        <div className="text-secondary text-sm">
          {formatRelativeOrAbsolute(timestamp)}
        </div>
      </Tooltip>
    </div>
  );
};

export default Timestamp;

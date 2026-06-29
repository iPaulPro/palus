import { MenuItem } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useReportPostModalStore } from "@/store/non-persisted/modal/useReportPostModalStore";

interface ReportProps {
  post: PostFragment;
}

const Report = ({ post }: ReportProps) => {
  const { setShowReportPostModal } = useReportPostModalStore();

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-red-500 text-sm"
        )
      }
      disabled={post.operations?.hasReported}
      onClick={(event) => {
        stopEventPropagation(event);
        if (!post.operations?.hasReported) {
          setShowReportPostModal(true, post.id);
        }
      }}
    >
      <div className="flex items-center gap-x-2">
        <ExclamationTriangleIcon className="size-4" />
        <div>{post.operations?.hasReported ? "Reported" : "Report post"}</div>
      </div>
    </MenuItem>
  );
};

export default Report;

import { MenuItem } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import { Link } from "react-router";
import cn from "@/helpers/cn";
import sanitizeDStorageUrl from "@/helpers/sanitizeDStorageUrl";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface Props {
  post: PostFragment;
}

const ViewMetadata = ({ post }: Props) => {
  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={stopEventPropagation}
    >
      <Link
        className="flex items-center space-x-2"
        rel="noopener noreferrer"
        target="_blank"
        to={sanitizeDStorageUrl(post.contentUri)}
      >
        <ArrowTopRightOnSquareIcon className="size-4" />
        <div>View metadata</div>
      </Link>
    </MenuItem>
  );
};

export default ViewMetadata;

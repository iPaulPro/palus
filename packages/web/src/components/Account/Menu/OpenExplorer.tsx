import { MenuItem } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import { Link } from "react-router";
import { BLOCK_EXPLORER_URL } from "@/data/constants";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface Props {
  account: AccountFragment;
}

const OpenExplorer = ({ account }: Props) => {
  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn({ "dropdown-active": focus }, "m-2 rounded-lg px-2 py-1.5 text-sm")
      }
      onClick={stopEventPropagation}
    >
      <Link
        className="flex items-center gap-x-2"
        rel="noreferrer noopener"
        target="_blank"
        to={`${BLOCK_EXPLORER_URL}/address/${account.address}`}
      >
        <ArrowTopRightOnSquareIcon className="size-4" />
        <div>View on explorer</div>
      </Link>
    </MenuItem>
  );
};

export default OpenExplorer;

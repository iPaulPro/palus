import { MenuItem } from "@headlessui/react";
import { WalletIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@palus/indexer";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface CopyAddressProps {
  account: AccountFragment;
}

const CopyAddress = ({ account }: CopyAddressProps) => {
  const copyAddress = useCopyToClipboard(
    account.address,
    "Address copied to clipboard!"
  );
  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={(event) => {
        stopEventPropagation(event);
        copyAddress();
      }}
    >
      <WalletIcon className="size-4" />
      <div>Copy address</div>
    </MenuItem>
  );
};

export default CopyAddress;

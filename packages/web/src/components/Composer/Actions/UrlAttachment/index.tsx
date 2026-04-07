import { MenuItem } from "@headlessui/react";
import { LinkIcon } from "@heroicons/react/24/outline";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface Props {
  disabled?: boolean;
  setShowModal: (show: boolean) => void;
}

const UrlAttachment = ({ disabled = false, setShowModal }: Props) => {
  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          "menu-item !flex cursor-pointer items-center gap-1 space-x-1 rounded-lg",
          { "dropdown-active": focus, "opacity-50": disabled }
        )
      }
      disabled={disabled}
      onClick={(event) => {
        stopEventPropagation(event);
        setShowModal(true);
      }}
    >
      <LinkIcon className="size-4" />
      <span className="text-sm">Attach from URL</span>
    </MenuItem>
  );
};

export default UrlAttachment;

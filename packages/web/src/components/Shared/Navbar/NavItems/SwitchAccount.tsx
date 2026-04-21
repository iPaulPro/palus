import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import cn from "@/helpers/cn";
import { useMobileDrawerModalStore } from "@/store/non-persisted/modal/useMobileDrawerModalStore";
import { useSwitchAccountModalStore } from "@/store/non-persisted/modal/useSwitchAccountModalStore";

interface SwitchAccountProps {
  className?: string;
}

const SwitchAccount = ({ className = "" }: SwitchAccountProps) => {
  const { setShow: setShowSwitchAccountModal } = useSwitchAccountModalStore();
  const { setShow: setShowMobileDrawer } = useMobileDrawerModalStore();

  return (
    <button
      className={cn(
        "flex w-full items-center space-x-1.5 px-2 py-1.5 text-left text-gray-700 text-sm dark:text-gray-200",
        className
      )}
      onClick={() => {
        setShowMobileDrawer(false);
        setShowSwitchAccountModal(true);
      }}
      type="button"
    >
      <ArrowsRightLeftIcon className="size-4" />
      <span>Switch account</span>
    </button>
  );
};

export default SwitchAccount;

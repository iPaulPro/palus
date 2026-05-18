import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import cn from "@/helpers/cn";
import { useLogoutAlertStore } from "@/store/non-persisted/alert/logoutAlertStore";

interface LogoutProps {
  className?: string;
  onClick?: () => void;
}

const Logout = ({ className = "", onClick }: LogoutProps) => {
  const { setShowLogout } = useLogoutAlertStore();

  return (
    <button
      className={cn(
        "flex w-full items-center space-x-1.5 px-2 py-1.5 text-left text-gray-700 text-sm dark:text-gray-200",
        className
      )}
      onClick={() => {
        onClick?.();
        setShowLogout(true);
      }}
      type="button"
    >
      <ArrowRightStartOnRectangleIcon className="size-4" />
      <div>Logout</div>
    </button>
  );
};

export default Logout;

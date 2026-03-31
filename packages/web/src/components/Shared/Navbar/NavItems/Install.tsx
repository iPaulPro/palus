import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import cn from "@/helpers/cn";
import { useInstallPromptStore } from "@/store/non-persisted/alert/installPromptStore";

interface Props {
  className?: string;
}

const Install = ({ className = "" }: Props) => {
  const { event } = useInstallPromptStore();

  if (!event) {
    return null;
  }

  return (
    <button
      className={cn(
        "flex w-full items-center space-x-1.5 px-2 py-1.5 text-left text-gray-700 text-sm dark:text-gray-200",
        className
      )}
      onClick={() => event?.prompt()}
      type="button"
    >
      <ArrowDownTrayIcon className="size-4" />
      <span>Install Palus</span>
    </button>
  );
};

export default Install;

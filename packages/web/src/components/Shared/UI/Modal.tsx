import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cva, type VariantProps } from "class-variance-authority";
import { memo, type ReactNode } from "react";
import stopEventPropagation from "@/helpers/stopEventPropagation";

const modalVariants = cva(
  "w-full scale-100 bg-white text-left shadow-xl dark:bg-gray-900 dark:border dark:border-border",
  {
    defaultVariants: { size: "sm" },
    variants: {
      size: {
        full: "h-full flex flex-col rounded-none",
        lg: "rounded-xl sm:max-w-5xl",
        md: "rounded-xl sm:max-w-xl",
        sm: "rounded-xl sm:max-w-lg",
        xs: "rounded-xl sm:max-w-sm"
      }
    }
  }
);

interface ModalProps extends VariantProps<typeof modalVariants> {
  children: ReactNode | ReactNode[];
  onClose?: () => void;
  show: boolean;
  preventClose?: boolean;
  title?: ReactNode;
}

const Modal = ({
  children,
  onClose,
  show,
  preventClose = false,
  size = "sm",
  title
}: ModalProps) => {
  return (
    <Dialog
      className="relative z-50 transition duration-300 ease-out data-closed:opacity-0"
      onClose={() => {
        if (!preventClose) {
          onClose?.();
        }
      }}
      open={show}
    >
      <DialogBackdrop
        className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80"
        onClick={stopEventPropagation}
      />
      <div
        className={`fixed flex items-center justify-center ${
          size === "full"
            ? "top-[var(--vvt)] left-0 h-[var(--vvh)] w-full overflow-hidden overscroll-contain p-0"
            : "inset-0 w-screen p-4"
        }`}
      >
        <DialogPanel className={modalVariants({ size })}>
          {title ? (
            <DialogTitle className="divider flex items-center justify-between px-5 py-3.5">
              <b>{title}</b>
              {onClose ? (
                <button
                  className="rounded-full p-1 text-gray-800 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  type="button"
                >
                  <XMarkIcon className="size-5" />
                </button>
              ) : null}
            </DialogTitle>
          ) : null}
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default memo(Modal);

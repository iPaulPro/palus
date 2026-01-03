import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cva, type VariantProps } from "class-variance-authority";
import { Fragment, memo, type ReactNode } from "react";

const modalVariants = cva(
  "w-full scale-100 bg-white text-left shadow-xl dark:bg-gray-800",
  {
    defaultVariants: { size: "sm" },
    variants: {
      size: {
        full: "h-full flex flex-col",
        lg: "inline-block rounded-xl sm:max-w-5xl sm:my-8 sm:align-middle",
        md: "inline-block rounded-xl sm:max-w-3xl sm:my-8 sm:align-middle",
        sm: "inline-block rounded-xl sm:max-w-lg sm:my-8 sm:align-middle",
        xs: "inline-block rounded-xl sm:max-w-sm sm:my-8 sm:align-middle"
      }
    }
  }
);

interface ModalProps extends VariantProps<typeof modalVariants> {
  afterLeave?: () => void;
  children: ReactNode | ReactNode[];
  onClose?: () => void;
  show: boolean;
  preventClose?: boolean;
  title?: ReactNode;
}

const Modal = ({
  afterLeave,
  children,
  onClose,
  show,
  preventClose = false,
  size = "sm",
  title
}: ModalProps) => {
  return (
    <Transition afterLeave={afterLeave} as={Fragment} show={show}>
      <Dialog
        as="div"
        className={`fixed z-10 flex items-center justify-center ${
          size === "full"
            ? "top-[var(--vvt)] left-0 h-[var(--vvh)] w-full overflow-hidden overscroll-contain p-0"
            : "inset-0 min-h-screen overflow-y-auto p-4 text-center sm:block sm:p-0"
        }`}
        onClose={() => {
          if (!preventClose) {
            onClose?.();
          }
        }}
        open={show}
      >
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" />
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80" />
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
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
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default memo(Modal);

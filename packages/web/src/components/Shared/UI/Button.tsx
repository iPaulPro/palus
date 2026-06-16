import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, m } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Spinner } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

const buttonVariants = cva(
  "rounded-full font-bold inline-flex items-center justify-center relative overflow-hidden disabled:opacity-50",
  {
    compoundVariants: [
      // Primary
      {
        class: cn(
          "text-white hover:text-white active:text-gray-100",
          "bg-gray-950 hover:bg-gray-800 active:bg-gray-700",
          "border border-gray-950 hover:border-gray-800 active:border-gray-700",
          "dark:text-gray-950 dark:hover:text-gray-900 dark:active:text-gray-600",
          "dark:bg-white dark:hover:bg-gray-200 dark:active:bg-gray-200",
          "dark:border-white dark:hover:border-gray-100 dark:active:border-gray-200"
        ),
        variant: "primary"
      },
      // Outline
      {
        class: cn(
          "text-gray-950 active:text-gray-500",
          "border border-gray-300 hover:border-gray-400",
          "dark:text-white dark:active:text-gray-700",
          "dark:border-gray-800 dark:hover:border-gray-600"
        ),
        variant: "outline"
      },
      // Danger
      {
        class: cn(
          "text-red-600 active:text-red-700",
          "border border-red-600 hover:border-red-700",
          "dark:text-red-500 dark:active:text-red-400",
          "dark:border-red-500 dark:hover:border-red-400"
        ),
        variant: "danger"
      }
    ],
    defaultVariants: {
      size: "md",
      variant: "primary"
    },
    variants: {
      size: {
        icon: "size-8",
        lg: "px-5 py-1.5",
        md: "px-4 py-1",
        sm: "px-3 py-0.5 text-sm"
      },
      variant: { danger: "", outline: "", primary: "" }
    }
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  ref?: Ref<HTMLButtonElement>;
}

const Button = ({
  children,
  className,
  disabled,
  icon,
  size,
  variant,
  loading,
  loadingText,
  ref,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ size, variant }), className)}
      disabled={disabled}
      ref={ref}
      type={rest.type ?? "button"}
      {...rest}
    >
      <AnimatePresence mode="wait">
        <m.div
          animate={loading ? "loading" : "idle"}
          className="flex items-center gap-x-1.5"
          initial="idle"
          transition={{ bounce: 0, duration: 0.2, type: "spring" }}
          variants={{
            idle: { opacity: 1, y: 0 },
            loading: { opacity: 0, y: -20 }
          }}
        >
          {icon}
          {children}
        </m.div>
        {loading && (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute flex items-center justify-center gap-x-1.5"
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ bounce: 0, duration: 0.2, type: "spring" }}
          >
            <Spinner size="xs" />
            {loadingText && <span>{loadingText}</span>}
          </m.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export { Button, buttonVariants };

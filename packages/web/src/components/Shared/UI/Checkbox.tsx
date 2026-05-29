import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, Ref } from "react";
import { memo, useId } from "react";
import cn from "@/helpers/cn";

const checkboxVariants = cva(
  "outline-0 focus:ring-0 mr-2 cursor-pointer rounded transition duration-200 dark:text-gray-500",
  {
    defaultVariants: { disabled: false },
    variants: {
      disabled: {
        false: "",
        true: "cursor-not-allowed opacity-50"
      }
    }
  }
);

interface CheckboxProps
  extends Omit<ComponentProps<"input">, "prefix" | "disabled">,
    VariantProps<typeof checkboxVariants> {
  className?: string;
  label?: string;
  labelClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

const Checkbox = ({
  className = "",
  label,
  labelClassName = "",
  disabled,
  ref,
  ...props
}: CheckboxProps) => {
  const id = useId();

  return (
    <div className="flex items-center">
      <input
        className={checkboxVariants({ className, disabled })}
        disabled={Boolean(disabled)}
        id={id}
        ref={ref}
        type="checkbox"
        {...props}
      />
      <label
        className={cn(
          "inline-block cursor-pointer whitespace-nowrap",
          labelClassName
        )}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};

export default memo(Checkbox);

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, Ref } from "react";
import { memo, useId } from "react";
import cn from "@/helpers/cn";
import { FieldError } from "./Form";

const textAreaVariants = cva(
  [
    "w-full rounded-xl border bg-white px-4 py-2 shadow-xs",
    "focus:border-gray-500 focus:ring-0",
    "disabled:bg-gray-500/20 disabled:opacity-60",
    "dark:bg-gray-900"
  ],
  {
    defaultVariants: { error: false },
    variants: {
      error: {
        false: "border-gray-300 dark:border-gray-800",
        true: "border-red-500 placeholder:text-red-500"
      }
    }
  }
);

interface TextAreaProps
  extends ComponentProps<"textarea">,
    VariantProps<typeof textAreaVariants> {
  label?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

const TextArea = ({
  className,
  error,
  label,
  ref,
  ...props
}: TextAreaProps) => {
  const id = useId();

  return (
    <label className="w-full" htmlFor={id}>
      {label ? <div className="label">{label}</div> : null}
      <textarea
        className={cn(textAreaVariants({ className, error }))}
        id={id}
        ref={ref}
        {...props}
      />
      {props.name ? <FieldError name={props.name} /> : null}
    </label>
  );
};

export default memo(TextArea);

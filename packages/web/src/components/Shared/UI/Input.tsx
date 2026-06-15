import type { ComponentProps, ReactNode, Ref } from "react";
import { memo, useId } from "react";
import cn from "@/helpers/cn";
import { FieldError } from "./Form";
import HelpTooltip from "./HelpTooltip";

interface InputProps extends Omit<ComponentProps<"input">, "prefix"> {
  className?: string;
  wrapperClassName?: string;
  error?: boolean;
  helper?: ReactNode;
  hideError?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  label?: ReactNode;
  prefix?: ReactNode | string;
  ref?: Ref<HTMLInputElement>;
}

const Input = ({
  className = "",
  wrapperClassName = "",
  error,
  helper,
  hideError = false,
  iconLeft,
  iconRight,
  label,
  prefix,
  type = "text",
  ref,
  ...props
}: InputProps) => {
  const id = useId();

  const iconStyles = [
    "text-zinc-500 [&>*]:peer-focus:text-gray-500 [&>*]:h-5",
    { "!text-red-500 [&>*]:peer-focus:!text-red-500": error }
  ];

  return (
    <label className="w-full" htmlFor={id}>
      {label ? (
        <div className="mb-1 flex items-center gap-x-1.5">
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {label}
          </div>
          <HelpTooltip>{helper}</HelpTooltip>
        </div>
      ) : null}
      <div className="flex">
        {prefix ? (
          <span className="inline-flex items-center rounded-l-xl border border-gray-300 border-r-0 bg-gray-100 px-3 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {prefix}
          </span>
        ) : null}
        <div
          className={cn(
            prefix ? "rounded-r-xl" : "rounded-xl",
            "flex w-full items-center border border-gray-300 bg-white focus-within:border-gray-500 dark:border-gray-800 dark:bg-gray-900",
            { "bg-gray-500/20! opacity-50": props.disabled },
            { "border-red-500!": error },
            wrapperClassName
          )}
        >
          <input
            className={cn(
              { "placeholder:text-red-500": error },
              prefix ? "rounded-r-xl" : "rounded-xl",
              "peer w-full border-none bg-transparent outline-hidden placeholder:text-muted focus:ring-0",
              className
            )}
            id={id}
            ref={ref}
            type={type}
            {...props}
          />
          <span
            className={cn({ "order-first pl-3": iconLeft }, iconStyles)}
            tabIndex={-1}
          >
            {iconLeft}
          </span>
          <span
            className={cn({ "order-last pr-3": iconRight }, iconStyles)}
            tabIndex={-1}
          >
            {iconRight}
          </span>
        </div>
      </div>
      {!hideError && props.name ? <FieldError name={props.name} /> : null}
    </label>
  );
};

export default memo(Input);

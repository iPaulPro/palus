import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { memo } from "react";
import cn from "@/helpers/cn";

const badgeVariants = cva("rounded-md border text-white text-xs shadow-xs", {
  defaultVariants: { size: "sm", variant: "primary" },
  variants: {
    size: { sm: "px-2" },
    variant: { primary: "border-black bg-black" }
  }
});

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

const Badge = ({
  children,
  className,
  variant,
  size,
  ref,
  ...rest
}: BadgeProps) => {
  return (
    <span
      className={cn(badgeVariants({ size, variant }), className)}
      ref={ref}
      {...rest}
    >
      {children}
    </span>
  );
};

export default memo(Badge);

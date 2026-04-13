import { cva, type VariantProps } from "class-variance-authority";
import { type ElementType, type MouseEvent, memo, type ReactNode } from "react";

const cardVariants = cva("flex flex-col border-border bg-card", {
  defaultVariants: { forceRounded: false },
  variants: {
    forceRounded: {
      false:
        "rounded-none border md:drop-shadow-card md:rounded-2xl md:border-none",
      true: "rounded-xl border"
    }
  }
});

interface CardProps extends VariantProps<typeof cardVariants> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

const Card = ({
  as: Tag = "div",
  children,
  className = "",
  forceRounded = false,
  onClick
}: CardProps) => {
  return (
    <Tag
      className={cardVariants({ className, forceRounded })}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
};

export default memo(Card);

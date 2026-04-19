import { cva, type VariantProps } from "class-variance-authority";
import {
  type CSSProperties,
  type ElementType,
  type MouseEvent,
  memo,
  type ReactNode,
  type Ref
} from "react";

const cardVariants = cva("flex flex-col border-border bg-card", {
  defaultVariants: { forceRounded: false },
  variants: {
    forceRounded: {
      false:
        "rounded-none border md:card-drop-shadow md:rounded-2xl md:border-none",
      true: "rounded-xl border"
    }
  }
});

interface CardProps extends VariantProps<typeof cardVariants> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
}

const Card = ({
  as: Tag = "div",
  children,
  className = "",
  forceRounded = false,
  onClick,
  ref,
  style
}: CardProps) => {
  return (
    <Tag
      className={cardVariants({ className, forceRounded })}
      onClick={onClick}
      ref={ref}
      style={style}
    >
      {children}
    </Tag>
  );
};

export default memo(Card);

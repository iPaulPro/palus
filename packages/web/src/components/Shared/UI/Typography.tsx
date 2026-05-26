import type { JSX, ReactNode, Ref } from "react";
import { createElement } from "react";
import cn from "@/helpers/cn";

interface TypographyProps {
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLHeadingElement>;
}

export const H2 = ({
  as = "h2",
  children,
  className = "",
  ref
}: TypographyProps) =>
  createElement(
    as,
    { className: cn("text-3xl font-bold", className), ref },
    children
  );

export const H3 = ({
  as = "h3",
  children,
  className = "",
  ref
}: TypographyProps) =>
  createElement(
    as,
    { className: cn("text-2xl font-bold", className), ref },
    children
  );

export const H4 = ({
  as = "h4",
  children,
  className = "",
  ref
}: TypographyProps) =>
  createElement(
    as,
    { className: cn("text-xl font-bold", className), ref },
    children
  );

export const H5 = ({
  as = "h5",
  children,
  className = "",
  ref
}: TypographyProps) =>
  createElement(
    as,
    { className: cn("text-lg font-bold", className), ref },
    children
  );

export const H6 = ({
  as = "h6",
  children,
  className = "",
  ref
}: TypographyProps) =>
  createElement(
    as,
    { className: cn("text-sm font-bold", className), ref },
    children
  );

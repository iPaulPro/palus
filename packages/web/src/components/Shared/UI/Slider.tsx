import * as SliderPrimitive from "@radix-ui/react-slider";
import { type ComponentProps, useMemo } from "react";
import cn from "@/helpers/cn";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  hideThumb = false,
  invert = false,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  hideThumb?: boolean;
  invert?: boolean;
}) {
  const _values = useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );
  return (
    <SliderPrimitive.Root
      className={cn(
        "group relative flex w-full touch-none select-none items-center data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-disabled:opacity-50",
        className
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-vertical:h-full data-horizontal:w-full data-vertical:w-1",
          {
            "bg-white/30": invert
          }
        )}
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute select-none bg-on-surface data-horizontal:h-full data-vertical:w-full",
            {
              "bg-white": invert
            }
          )}
          data-slot="slider-range"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          className={cn(
            "relative block size-4 shrink-0 select-none rounded-full border border-ring bg-on-surface ring-ring/50 transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:ring-3 disabled:pointer-events-none disabled:opacity-50",
            {
              "bg-white": invert,
              "opacity-0 transition-opacity group-hover:opacity-100": hideThumb
            }
          )}
          data-slot="slider-thumb"
          key={index}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

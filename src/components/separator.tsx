import { cn } from "~/lib/utils";
import React from "react";

export const VerticalSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "min-h-full w-[3px] flex-none rounded bg-accent/50",
      className,
    )}
    {...props}
    ref={ref}
  />
));
VerticalSeparator.displayName = "VerticalSeparator";

export const HorizontalSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "h-[3px] min-w-full flex-none rounded bg-accent/50",
      className,
    )}
    {...props}
    ref={ref}
  />
));
HorizontalSeparator.displayName = "HorizontalSeparator";

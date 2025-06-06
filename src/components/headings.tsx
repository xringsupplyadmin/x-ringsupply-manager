import { cn } from "~/lib/utils";
import React from "react";

export const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h1 className={cn("text-3xl font-bold", className)} ref={ref} {...props} />
  );
});
PageTitle.displayName = "PageTitle";

export const PageSubtitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h2
      className={cn("text-xl font-semibold", className)}
      ref={ref}
      {...props}
    />
  );
});
PageSubtitle.displayName = "PageSubtitle";

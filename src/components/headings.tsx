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

export const Heading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3 className={cn("text-xl font-medium", className)} ref={ref} {...props} />
  );
});
Heading.displayName = "Heading";

export const SubHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h4 className={cn("text-lg font-medium", className)} ref={ref} {...props} />
  );
});
SubHeading.displayName = "SubHeading";

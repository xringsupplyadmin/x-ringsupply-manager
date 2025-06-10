import { Check, X } from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

export const SuccessCheckIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof Check>
>(({ className, ...props }, ref) => (
  <Check
    className={cn("rounded-md bg-success", className)}
    {...props}
    ref={ref}
  />
));
SuccessCheckIcon.displayName = "SuccessCheckIcon";

export const ErrorXIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof X>
>(({ className, ...props }, ref) => (
  <X
    className={cn("rounded-md bg-destructive", className)}
    {...props}
    ref={ref}
  />
));
ErrorXIcon.displayName = "ErrorXIcon";

export const WarningCheckIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof Check>
>(({ className, ...props }, ref) => (
  <Check
    className={cn("rounded-md bg-warning", className)}
    {...props}
    ref={ref}
  />
));
WarningCheckIcon.displayName = "WarningCheckIcon";

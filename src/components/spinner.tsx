import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import React from "react";

export function Spinner({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Loader2>) {
  return <Loader2 className={cn(className, "animate-spin")} {...props} />;
}

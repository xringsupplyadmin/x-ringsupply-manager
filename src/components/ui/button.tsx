import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";
import { Spinner } from "../spinner";
import { SimpleTooltip } from "~/components/ui/tooltip";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  iconAlignEnd?: boolean;
  pending?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      title,
      className,
      variant,
      size,
      asChild = false,
      icon,
      iconAlignEnd,
      pending,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    icon = !!icon && pending ? <Spinner /> : icon;
    if (icon && asChild)
      console.warn(
        "`icon` is not supported with `asChild` prop and has no effect. Add the icon directly to the child component isntead.",
      );
    const button = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={pending}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon && !iconAlignEnd && icon}
            {icon ? <div className="flex-grow">{children}</div> : children}
            {icon && iconAlignEnd && icon}
          </>
        )}
      </Comp>
    );

    if (title) {
      return <SimpleTooltip title={title}>{button}</SimpleTooltip>;
    } else {
      return button;
    }
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

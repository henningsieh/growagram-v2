import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex font-medium items-center justify-center gap-2 whitespace-nowrap rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border border-green-700/80 bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        outline:
          "border bg-muted text-muted-foreground border-input shadow-sm hover:bg-background hover:text-white hover:text-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "font-bold bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-4",
        sm: "h-8 px-3 py-3 text-xs",
        lg: "h-12 border-2 rounded-md font-semibold px-8 py-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

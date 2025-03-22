import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex font-medium items-center justify-center gap-2 whitespace-nowrap rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80",
        timeline: 
          "bg-input/90 border border-input/80 text-foreground shadow-md hover:bg-input/80",
        grow: 
          "bg-secondary/90 border border-secondary/80 text-secondary-foreground shadow-md hover:bg-secondary/80",
        plant: 
          "bg-primary/90 border border-primary/80 text-primary-foreground shadow-md hover:bg-primary/80",
        outline:
          "border bg-muted text-muted-foreground border-input shadow-md hover:bg-background hover:text-white hover:text-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline",
        destructive:
          "font-bold bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/80",
      },
      size: {
        default: "h-10 px-4 py-4",
        sm: "h-8 px-3 py-3 text-sm font-semibold",
        lg: "h-12 border-2 text-lg rounded-md font-semibold px-8 py-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

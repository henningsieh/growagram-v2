import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        grow: 
          "bg-secondary/50 border border border-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70",
        plant: 
          "bg-primary/50 border border border-primary text-primary-foreground shadow-sm hover:bg-primary/70",
        strain: 
          "bg-fuchsia-600/40 border border border-seedling text-foreground shadow-sm hover:bg-fuchsia-600/50",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

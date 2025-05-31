import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-md border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}/**
 * Enhanced CardTitle Component
 *
 * Changes from original shadcn/ui CardTitle:
 * - Added polymorphic "as" prop to render as different heading elements (h1-h6)
 * - Implemented TypeScript generics to maintain proper type safety
 * - Default element remains "div" for backward compatibility
 *
 * Original component only rendered as a div element with no flexibility for
 * semantic heading levels. This enhancement allows for proper document structure
 * while maintaining the same visual styling.
 *
 * Usage:
 * <CardTitle>Default (renders as div)</CardTitle>
 * <CardTitle as="h1">Primary Heading</CardTitle>
 * <CardTitle as="h3">Section Heading</CardTitle>
 */

// Define the polymorphic component types
type AsProp<C extends React.ElementType> = {
  as?: C
}

type PropsWithAs<C extends React.ElementType, Props = object> = AsProp<C> &
  Omit<React.ComponentPropsWithoutRef<C>, keyof AsProp<C> | keyof Props> &
  Props

// The CardTitle component with polymorphic "as" prop
function CardTitle<C extends React.ElementType = "div">({
  as,
  className,
  ...props
}: PropsWithAs<C, { className?: string }>) {
  const Component = as || "div"

  return (
    <Component
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

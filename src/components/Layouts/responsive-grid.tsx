// src/components/Layouts/responsive-grid.tsx:
import * as React from "react";
import { cn } from "~/lib/utils";

export default function ResponsiveGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid auto-rows-auto gap-4",
        // Default state - start with 1 column
        "grid-cols-1",

        // Using Tailwind's standard breakpoint pattern
        "[@container_maincontent_(min-width:theme(--breakpoint-sm))_and_(max-width:calc(theme(--breakpoint-md)-1px))]:!grid-cols-2",
        "[@container_maincontent_(min-width:theme(--breakpoint-md))_and_(max-width:calc(theme(--breakpoint-lg)-1px))]:!grid-cols-2",
        "[@container_maincontent_(min-width:theme(--breakpoint-lg))_and_(max-width:calc(theme(--breakpoint-xl)-1px))]:!grid-cols-3",
        "[@container_maincontent_(min-width:theme(--breakpoint-xl))_and_(max-width:calc(theme(--breakpoint-2xl)-1px))]:!grid-cols-4",
        "[@container_maincontent_(min-width:theme(--breakpoint-2xl))_and_(max-width:calc(theme(--breakpoint-3xl)-1px))]:!grid-cols-5",
        "[@container_maincontent_(min-width:theme(--breakpoint-2xl))]:!grid-cols-6",

        className,
      )}
      // part=".css"
    >
      {children}
    </div>
  );
}

/**
 * Responsive image sizes string for Next.js Image component
 * 1. Next.js Image component's sizes attribute only supports standard media queries with viewport units
 * 2. We can't directly reference container queries in the sizes attribute
 * 3. The values now show the percentage of viewport width that approximates the container's column width
 */
export const RESPONSIVE_IMAGE_SIZES =
  "(min-width: 1920px) 16.67vw, (min-width: 1600px) 20vw, (min-width: 1280px) 25vw, (min-width: 960px) 33.33vw, (min-width: 640px) 50vw, 100vw";

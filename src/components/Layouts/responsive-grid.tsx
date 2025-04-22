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
        "grid auto-rows-auto grid-cols-1 gap-4",
        // Explicit container query sizes that match traditional breakpoints
        "[@container_main_(min-width:640px)]:grid-cols-2",
        "[@container_main_(min-width:960px)]:grid-cols-3",
        "[@container_main_(min-width:1280px)]:grid-cols-4",
        "[@container_main_(min-width:1600px)]:grid-cols-5",
        "[@container_main_(min-width:1920px)]:grid-cols-6",

        className,
      )}
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

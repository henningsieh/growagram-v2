// src/components/Layouts/responsive-grid.tsx:
import * as React from "react";

export default function ResponsiveGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

/**
 * Responsive image sizes for the Cards in the grid
 */
export const RESPONSIVE_IMAGE_SIZES =
  "(min-width: 1280px) min(380px, 33.333vw), (min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw";

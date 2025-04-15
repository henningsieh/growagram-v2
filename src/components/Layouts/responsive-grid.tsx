// src/components/Layouts/responsive-grid.tsx:
import * as React from "react";

export default function ResponsiveGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 @xs:grid-cols-1 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @[112rem]:grid-cols-5">
      {children}
    </div>
  );
}

/**
 * Responsive image sizes for the Cards in the grid
 * Using container query-based sizing
 */
export const RESPONSIVE_IMAGE_SIZES =
  "(min-width: 1280px) min(380px, 33.333vw), (min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw";
// "(container: 1536px) min(300px, 25cqw), (container: 1280px) min(320px, 33.333cqw), (container: 960px) min(300px, 50cqw), (container: 640px) min(320px, 50cqw), 100cqw";

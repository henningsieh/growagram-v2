"use client";

import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import { Skeleton } from "~/components/ui/skeleton";

interface ExploreGrowsLoadingProps {
  itemCount?: number;
}

export function ExploreGrowsLoading({
  itemCount = 12,
}: ExploreGrowsLoadingProps) {
  return (
    <div className="space-y-4">
      {/* Loading header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Loading grid */}
      <ResponsiveGrid>
        {Array.from({ length: itemCount }).map((_, index) => (
          <ExploreGrowCardSkeleton key={index} />
        ))}
      </ResponsiveGrid>

      {/* Loading footer */}
      <div className="flex justify-center py-4">
        <Skeleton className="h-6 w-40" />
      </div>
    </div>
  );
}

function ExploreGrowCardSkeleton() {
  return (
    <div className="bg-card border-border/50 overflow-hidden rounded-lg border shadow-sm">
      {/* Header image skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full" />
        {/* Badge skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Meta info */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

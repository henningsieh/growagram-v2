import { Skeleton } from "~/components/ui/skeleton";

export default function LoadingProfile() {
  return (
    <div className="space-y-6">
      {/* Profile header skeleton */}
      <div className="xs:gap-3 mt-3 mb-5 flex items-center gap-2 sm:gap-4">
        {/* The issue is with aspect ratio - we need to use an aspect-square container */}
        <div className="xs:h-16 xs:w-16 aspect-square h-14 w-14 flex-shrink-0 sm:h-24 sm:w-24">
          <Skeleton className="h-full w-full rounded-full" />
        </div>
        <div className="xs:gap-1 flex w-full flex-col gap-0.5 px-0 sm:gap-2">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

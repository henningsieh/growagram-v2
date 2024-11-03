import { Skeleton } from "~/components/ui/skeleton";

function LoadingGrid() {
  const items = Array.from({ length: 2 }); // Match the query limit of 2

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border shadow-sm"
          >
            <div className="relative aspect-video p-1">
              <Skeleton className="h-full w-full" />{" "}
              {/* Image placeholder with correct aspect ratio */}
            </div>
            <div className="p-1">
              <Skeleton className="h-5 w-full bg-zinc-600/40" />{" "}
              {/* Date/time text placeholder */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserImagesLoadingGrid() {
  return <LoadingGrid />;
}

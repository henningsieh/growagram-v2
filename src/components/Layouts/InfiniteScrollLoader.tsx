import { Loader2 } from "lucide-react";
import React, { forwardRef } from "react";

interface InfiniteScrollLoaderProps {
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  itemsLength?: number;
  noMoreMessage?: string;
  className?: string;
}

const InfiniteScrollLoader = forwardRef<
  HTMLDivElement,
  InfiniteScrollLoaderProps
>(
  (
    {
      isLoading = false,
      isFetchingNextPage = false,
      hasNextPage = false,
      itemsLength = 0,
      noMoreMessage = "No more items to load.",
      className = "",
    },
    ref,
  ) => {
    return (
      <div className={className}>
        {/* Loading spinner */}
        {(isLoading || isFetchingNextPage) && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* No more items message */}
        {!hasNextPage && itemsLength > 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            {noMoreMessage}
          </p>
        )}

        {/* Intersection Observer target */}
        {hasNextPage && <div ref={ref} className="h-4" />}
      </div>
    );
  },
);

InfiniteScrollLoader.displayName = "InfiniteScrollLoader";

export default InfiniteScrollLoader;

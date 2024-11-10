"use client";

import { useCallback, useEffect, useRef } from "react";
import SpinningLoader from "~/components/Layouts/loader";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import { api } from "~/lib/trpc/react";

import ImageCard from "./image-card";

export function ImageGrid() {
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.image.getOwnImages.useInfiniteQuery(
    {
      limit: 2,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const userImages = data?.pages.flatMap((page) => page.images) ?? [];

  // Intersection Observer callback
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  // Set up intersection observer
  const loadingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.01, // Trigger when even 10% of the element is visible
    });
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  // Handling case if user hasn't uploaded any images
  if (!isFetching && userImages.length === 0) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        You haven&apos;t uploaded any images yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveGrid>
        {userImages.map((image, key) => (
          <ImageCard image={image} key={key} />
        ))}
      </ResponsiveGrid>

      {(isLoading || isFetchingNextPage) && <SpinningLoader />}
      {!hasNextPage && userImages.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No more images to load.
        </p>
      )}

      {/* Intersection Observer target */}
      {hasNextPage && <div ref={loadingRef}></div>}
    </div>
  );
}

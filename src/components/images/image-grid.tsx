"use client";

// src/components/images/image-grid.tsx
import { useLocale } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { api } from "~/lib/trpc/react";
import { formatDate, formatTime } from "~/lib/utils";
import type { UserImage } from "~/server/api/root";

export function ImageGrid() {
  const locale = useLocale();
  const loadingRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.image.getUserImages.useInfiniteQuery(
      {
        limit: 2,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  // Flatten all pages of images into a single array
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
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.1, // Trigger when even 10% of the element is visible
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect]);

  if (!isFetching && userImages.length === 0) {
    return (
      <p className="mt-8 text-center text-gray-500">
        You haven&apos;t uploaded any images yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userImages.map((image: UserImage) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-lg border shadow-sm"
          >
            <div className="relative aspect-video">
              <Image
                src={image.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-500">
                Uploaded:{" "}
                {formatDate(image.createdAt, locale, {
                  includeYear: true,
                })}
                {" at "}
                {formatTime(image.createdAt, locale, {
                  includeSeconds: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Intersection Observer target */}
      {hasNextPage && (
        <div ref={loadingRef} className="mt-4 flex justify-center p-4">
          {isFetchingNextPage && (
            <div className="text-sm text-gray-500">Loading more images...</div>
          )}
        </div>
      )}
    </div>
  );
}

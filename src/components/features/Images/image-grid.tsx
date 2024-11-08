"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { api } from "~/lib/trpc/react";
import { formatDate, formatTime } from "~/lib/utils";
import type { UserImage } from "~/server/api/root";

import ImageCard from "./image-card";
import UserImagesLoadingGrid from "./loading-grid";

export function ImageGrid() {
  const locale = useLocale();

  const {
    data,
    isFetching,
    isPending,
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

  const loadingRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer
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
      <p className="mt-8 text-center text-gray-500">
        You haven&apos;t uploaded any images yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {isPending && <UserImagesLoadingGrid />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userImages.map((image: UserImage, key) => (
          <ImageCard image={image} key={key} />
        ))}
      </div>

      {hasNextPage && isFetchingNextPage && <UserImagesLoadingGrid />}

      {/* Intersection Observer target */}
      {hasNextPage && <div ref={loadingRef}></div>}
    </div>
  );
}

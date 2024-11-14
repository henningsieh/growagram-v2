"use client";

// src/app/[locale]/(protected)/images/page.tsx
import { useCallback, useEffect, useRef } from "react";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ImageCard from "~/components/features/Images/image-card";
import { api } from "~/lib/trpc/react";
import { GetUserImagesInput, UserImage } from "~/server/api/root";

export default function ImagesPage() {
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.image.getOwnImages.useInfiniteQuery(
    { limit: 2 } satisfies GetUserImagesInput, // Strictly validated input
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const userImages: UserImage[] =
    data?.pages.flatMap((page) => page.images) ?? [];

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

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
      buttonLink="/images/upload"
      buttonLabel="Upload Images"
    >
      {/* Handling case if user hasn't uploaded any images */}
      {!isFetching && userImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          You haven&apos;t uploaded any images yet.
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userImages.map((image, key) => (
              <ImageCard image={image} key={key} />
            ))}
          </ResponsiveGrid>

          <InfiniteScrollLoader
            ref={loadingRef}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={userImages.length || 0}
            noMoreMessage="No more images to load."
          />
        </>
      )}
    </PageHeader>
  );
}

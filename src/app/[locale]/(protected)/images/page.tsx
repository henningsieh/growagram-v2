"use client";

// src/app/[locale]/(protected)/images/page.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ImageCard from "~/components/features/Images/image-card";
import ImageSortControls from "~/components/features/Images/sort-controls";
import { api } from "~/lib/trpc/react";
import { GetUserImagesInput, UserImage } from "~/server/api/root";
import { ImageSortField, SortOrder } from "~/types/image";

export default function ImagesPage() {
  const [sortField, setSortField] = useState<ImageSortField>(
    ImageSortField.CREATED_AT,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);

  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = api.image.getOwnImages.useInfiniteQuery(
    {
      limit: 12,
      sortField,
      sortOrder,
    } satisfies GetUserImagesInput, // Strictly validated input
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  const userImages: UserImage[] =
    data?.pages.flatMap((page) => page.images) ?? [];

  // Intersection Observer callback remains the same
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  // Set up intersection observer (remains the same)
  const loadingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "0px",
      threshold: 0.01,
    });
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  // Handle sort changes
  const handleSortChange = useCallback(
    async (field: ImageSortField, order: SortOrder) => {
      setSortField(field);
      setSortOrder(order);
      await refetch();
    },
    [refetch],
  );

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
      buttonLink="/images/upload"
      buttonLabel="Upload Images"
    >
      {/* Sorting controls */}
      <ImageSortControls
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {!isFetching && userImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          You haven&apos;t uploaded any images yet.
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userImages.map((image, key) => (
              <ImageCard image={image} key={key} sortField={sortField} />
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

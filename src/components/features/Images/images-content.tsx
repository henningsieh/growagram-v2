"use client";

// src/components/features/Images/images-content.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ImageCard from "~/components/features/Images/image-card";
import ImagesControls from "~/components/features/Images/images-controlls";
import { api } from "~/lib/trpc/react";
import { GetOwnImagesInput, ImageWithPlants } from "~/server/api/root";
import { ImageSortField, SortOrder } from "~/types/image";

export default function ImagesContent() {
  const [sortField, setSortField] = useState<ImageSortField>(
    ImageSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [filterNotConnected, setFilterNotConnected] = useState(false);

  // Get the utils for accessing the cache
  const utils = api.useUtils();

  // Get the prefetched data from the cache
  const initialData = utils.image.getOwnImages.getInfiniteData({
    // the input must match the server-side `prefetchInfinite`
    limit: 2,
  } satisfies GetOwnImagesInput);

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
      limit: 2, // for DEV mode and testing, 12 in PRODUCTION mode
      sortField,
      sortOrder,
    } satisfies GetOwnImagesInput,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData, // Use the prefetched data
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  const userImages: ImageWithPlants[] =
    data?.pages.flatMap((page) => page.images) ?? [];

  const filteredUserImages = filterNotConnected
    ? userImages.filter((image) => image.plantImages.length === 0)
    : userImages;

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

  const handleFilterChange = (checked: boolean) => {
    setFilterNotConnected(checked);
  };

  return (
    <PageHeader
      title="All Images"
      subtitle="View and manage your current images"
      buttonLink="/images/upload"
      buttonLabel="Upload Images"
    >
      <ImagesControls
        sortField={sortField}
        sortOrder={sortOrder}
        filterNotConnected={filterNotConnected}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />
      {!isFetching && filteredUserImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {filterNotConnected
            ? "No unconnected images found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {filteredUserImages.map((image, key) => (
              <ImageCard image={image} key={key} sortField={sortField} />
            ))}
          </ResponsiveGrid>
          <InfiniteScrollLoader
            ref={loadingRef}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={filteredUserImages.length || 0}
            noMoreMessage="No more images to load."
          />
        </>
      )}
    </PageHeader>
  );
}

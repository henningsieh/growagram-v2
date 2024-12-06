"use client";

// src/app/[locale]/(protected)/photos/page.tsx:
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import PhotoCard from "~/components/features/Photos/photo-card";
import ImagesSortFilterControlls from "~/components/features/Photos/sort-filter-controlls";
import { api } from "~/lib/trpc/react";
import {
  GetOwnImageType,
  GetOwnImagesInput,
  GetOwnImagesOutput,
  GetOwnImagesType,
} from "~/server/api/root";
import { ImageSortField, ImageSortOrder } from "~/types/image";

export default function AllImagesPage() {
  const searchParams = useSearchParams();
  // const router = useRouter();
  const utils = api.useUtils();

  const [sortField, setSortField] = useState<ImageSortField>(
    (searchParams.get("sortField") as ImageSortField) ||
      ImageSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<ImageSortOrder>(
    (searchParams.get("sortOrder") as ImageSortOrder) || ImageSortOrder.DESC,
  );
  const [filterNotConnected, setFilterNotConnected] = useState(
    searchParams.get("filterNotConnected") === "true",
  );

  // Get the prefetched data from the cache
  const initialData = utils.image.getOwnImages.getInfiniteData({
    // the input must match the server-side `prefetchInfinite`
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Load own images from database
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.image.getOwnImages.useInfiniteQuery(
    {
      limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
      sortField,
      sortOrder,
      filterNotConnected,
    } satisfies GetOwnImagesInput,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData,
    },
  );

  const photos: GetOwnImagesType =
    data?.pages?.flatMap((page) => page.images satisfies GetOwnImagesType) ??
    [];

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

  // Handle sort changes
  const handleSortChange = async (
    field: ImageSortField,
    order: ImageSortOrder,
  ) => {
    // Update the state
    setSortField(field);
    setSortOrder(order);
  };

  // Handle filter changes
  const handleFilterChange = async (checked: boolean) => {
    // First invalidate the cache for all queries
    // await utils.image.getOwnImages.invalidate();
    setFilterNotConnected(checked);

    // await refetch();
  };

  return (
    <PageHeader
      title="My Photos"
      subtitle="View and manage your photos"
      buttonLink="/photos/upload"
      buttonLabel="Upload new Photos"
    >
      <ImagesSortFilterControlls
        sortField={sortField}
        sortOrder={sortOrder}
        isFetching={isFetching}
        filterNotConnected={filterNotConnected}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />
      {!isFetching && photos.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : (
        <>
          <ResponsiveGrid>
            {photos.map((image) => (
              <PhotoCard
                image={image satisfies GetOwnImageType}
                key={image.id}
                sortField={sortField satisfies ImageSortField}
                currentQuery={{
                  page: 1,
                  sortField,
                  sortOrder,
                  filterNotConnected,
                }}
              />
            ))}
          </ResponsiveGrid>
          <InfiniteScrollLoader
            ref={loadingRef}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={photos.length}
            noMoreMessage="No more plants to load."
          />
        </>
      )}
    </PageHeader>
  );
}

"use client";

// src/components/features/Photos/Views/infinite-scroll.tsx:
import * as React from "react";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import PhotoCard from "~/components/features/Photos/photo-card";
import { useRouter } from "~/lib/i18n/routing";
import { trpc } from "~/lib/trpc/react";
import type { GetOwnPhotosInput, GetOwnPhotosType } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

export default function PhotosInfiniteScrollView({
  sortField,
  sortOrder,
  filterNotConnected,
  setIsFetching,
}: {
  sortField: PhotosSortField;
  sortOrder: SortOrder;
  filterNotConnected: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) {
      params.delete("page");
      router.replace(`${modulePaths.PHOTOS.path}?${params.toString()}`, {
        scroll: false,
      });
    }
  }, [router]);

  // Get initial data from cache with proper structure
  const queryInput = {
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnPhotosInput;

  // Get initial data from cache with correct input structure
  const initialData = utils.photos.getOwnPhotos.getInfiniteData(queryInput);

  // Infinite query with matching input
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.photos.getOwnPhotos.useInfiniteQuery(queryInput, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData || undefined,
  });

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  // Extract photos from pages
  const photos: GetOwnPhotosType =
    data?.pages?.flatMap((page) => page.images satisfies GetOwnPhotosType) ??
    [];

  // Intersection Observer callback
  const onIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  // Set up intersection observer
  const loadingRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
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
    <>
      {isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : photos.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isSocial={false}
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
    </>
  );
}

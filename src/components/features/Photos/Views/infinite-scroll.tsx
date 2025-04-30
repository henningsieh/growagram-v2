"use client";

// src/components/features/Photos/Views/infinite-scroll.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { PhotoCard } from "~/components/features/Photos/photo-card";
import { useIntersectionObserver } from "~/hooks/use-intersection";
import { getOwnPhotosInput } from "~/lib/queries/photos";
import type { GetOwnPhotosInput, GetOwnPhotosType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
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
  const trpc = useTRPC();
  const t = useTranslations("Photos");

  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...trpc.photos.getOwnPhotos.infiniteQueryOptions(
        {
          ...getOwnPhotosInput,
          sortField,
          sortOrder,
          filterNotConnected,
        } satisfies GetOwnPhotosInput,
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    });

  // Extract photos from pages - with suspend, data is guaranteed to be defined
  const photos = data.pages.flatMap(
    (page) => page.images satisfies GetOwnPhotosType,
  );

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  // Configure the callback for intersection
  const fetchNextPageCallback = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Use our custom intersection observer hook
  const loadingRef = useIntersectionObserver(fetchNextPageCallback);

  return (
    <>
      {photos.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {filterNotConnected
            ? t("no-photos-yet-filtered")
            : t("no-photos-yet")}
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
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={photos.length}
            noMoreMessage="No more photos to load."
          />
        </>
      )}
    </>
  );
}

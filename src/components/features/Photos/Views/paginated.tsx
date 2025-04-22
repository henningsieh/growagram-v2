"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseQuery } from "@tanstack/react-query";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import PhotoCard from "~/components/features/Photos/photo-card";
import { getOwnPhotosInput } from "~/lib/queries/photos";
import type { GetOwnPhotosInput } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { PhotosSortField } from "~/types/image";

interface PaginatedPhotosViewProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  sortField: PhotosSortField;
  sortOrder: SortOrder;
  filterNotConnected: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PhotosPaginatedView({
  currentPage: cursor,
  onPageChange,
  sortField,
  sortOrder,
  filterNotConnected,
  setIsFetching,
}: PaginatedPhotosViewProps) {
  const trpc = useTRPC();
  const t = useTranslations("Photos");

  const photosQuery = useSuspenseQuery(
    trpc.photos.getOwnPhotos.queryOptions({
      ...getOwnPhotosInput,
      cursor: cursor,
      sortField: sortField,
      sortOrder: sortOrder,
      filterNotConnected: filterNotConnected,
    } satisfies GetOwnPhotosInput),
  );

  // Extract photos data
  const { images: photos, totalPages } = photosQuery.data;

  // No need to calculate totalPages anymore since it comes directly from the API

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(photosQuery.isFetching);
  }, [photosQuery.isFetching, setIsFetching]);

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
                  page: cursor,
                  sortField,
                  sortOrder,
                  filterNotConnected,
                }}
              />
            ))}
          </ResponsiveGrid>

          <ItemsPagination
            currentPage={cursor}
            totalPages={totalPages}
            isFetching={photosQuery.isFetching}
            handlePageChange={onPageChange}
          />
        </>
      )}
    </>
  );
}

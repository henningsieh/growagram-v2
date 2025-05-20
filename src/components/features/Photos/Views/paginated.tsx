"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
// src/components/features/Photos/Views/paginated.tsx:
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import PhotoCard from "~/components/features/Photos/photo-card";
import { useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";
import type { GetOwnPhotosInput } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

export default function PhotosPaginatedView({
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("Photos");

  const [currentPage, setCurrentPage] = React.useState(
    parseInt(searchParams?.get("page") || "1"),
  );

  // Function to update URL query params
  const updateUrlParams = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    params.set("filterNotConnected", filterNotConnected.toString());
    router.push(`?${params.toString()}`);
  }, [currentPage, sortField, sortOrder, filterNotConnected, router]);

  // Sync state with URL query params
  React.useEffect(() => {
    updateUrlParams();
  }, [currentPage, sortField, sortOrder, filterNotConnected, updateUrlParams]);

  // Get initial data from cache
  const initialData = queryClient.getQueryData(
    trpc.photos.getOwnPhotos.queryKey({
      cursor: currentPage,
      limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
      sortField,
      sortOrder,
      filterNotConnected,
    } satisfies GetOwnPhotosInput),
  );

  // Query images
  const { data, isLoading, isFetching } = useQuery(
    trpc.photos.getOwnPhotos.queryOptions(
      {
        limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
        cursor: currentPage,
        sortField,
        sortOrder,
        filterNotConnected,
      } satisfies GetOwnPhotosInput,
      {
        initialData,
      },
    ),
  );
  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  const userPhotos = data?.images ?? [];
  const totalPages = data?.total ?? 1;

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : userPhotos.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {filterNotConnected
            ? t("no-photos-yet-filtered")
            : t("no-photos-yet")}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isSocial={false}
                currentQuery={{
                  page: currentPage,
                  sortField,
                  sortOrder,
                  filterNotConnected,
                }}
              />
            ))}
          </ResponsiveGrid>

          <ItemsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            isFetching={isFetching}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

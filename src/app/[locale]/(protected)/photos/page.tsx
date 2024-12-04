"use client";

// src/app/[locale]/(protected)/photos/page.tsx:
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import PhotoCard from "~/components/features/Photos/photo-card";
import ImagesSortFilterControlls from "~/components/features/Photos/sort-filter-controlls";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { GetOwnImagesInput } from "~/server/api/root";
import { ImageSortField, SortOrder } from "~/types/image";

export default function AllImagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL query params
  const [state, setState] = useState({
    currentPage: parseInt(searchParams.get("page") || "1"),
    sortField:
      (searchParams.get("sortField") as ImageSortField) ||
      ImageSortField.UPLOAD_DATE,
    sortOrder: (searchParams.get("sortOrder") as SortOrder) || SortOrder.DESC,
    filterNotConnected: searchParams.get("filterNotConnected") === "true",
  });

  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const utils = api.useUtils();

  // Get the prefetched data from the cache
  const prefetchedFromCache = utils.image.getOwnImages.getData({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    page: state.currentPage,
    sortField: state.sortField,
    sortOrder: state.sortOrder,
    filterNotConnected: state.filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Load own images from database
  const { data, isLoading, isFetching } = api.image.getOwnImages.useQuery(
    {
      limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
      page: state.currentPage,
      sortField: state.sortField,
      sortOrder: state.sortOrder,
      filterNotConnected: state.filterNotConnected,
    } satisfies GetOwnImagesInput,
    {
      initialData: prefetchedFromCache,
    },
  );

  const userImages = data?.images ?? [];
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    // Update URL parameters
    const params = new URLSearchParams();
    params.set("page", state.currentPage.toString());
    params.set("sortField", state.sortField);
    params.set("sortOrder", state.sortOrder);
    if (state.filterNotConnected) {
      params.set("filterNotConnected", "true");
    } else {
      params.delete("filterNotConnected");
    }
    router.push(`?${params.toString()}`);
  }, [state, router]);

  const memoizedSortChange = useCallback(
    async (field: ImageSortField, order: SortOrder) => {
      updateState({ sortField: field, sortOrder: order });
    },
    [updateState],
  );

  const memoizedFilterChange = useCallback(
    (checked: boolean) => {
      updateState({ filterNotConnected: checked, currentPage: 1 });
    },
    [updateState],
  );

  // Handle page changes
  const handlePageChange = (page: number) => {
    updateState({ currentPage: page });
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: number[] = [];
    const showAroundCurrent = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= state.currentPage - showAroundCurrent &&
          i <= state.currentPage + showAroundCurrent)
      ) {
        pages.push(i);
      }
    }

    return pages.reduce((acc: (number | string)[], page, index, array) => {
      if (index > 0 && array[index - 1] !== page - 1) {
        acc.push("...");
      }
      acc.push(page);
      return acc;
    }, []);
  };

  return (
    <PageHeader
      title="All Photos"
      subtitle="View and manage your photos"
      buttonLink="/photos/upload"
      buttonLabel="Upload new Photos"
    >
      <ImagesSortFilterControlls
        sortField={state.sortField}
        sortOrder={state.sortOrder}
        isFetching={isFetching}
        filterNotConnected={state.filterNotConnected}
        onSortChange={memoizedSortChange}
        onFilterChange={memoizedFilterChange}
      />
      {!isFetching && userImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {state.filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : (
        <>
          <ResponsiveGrid>
            {userImages.map((image) => (
              <PhotoCard
                image={image}
                key={image.id}
                sortField={state.sortField}
                currentQuery={{
                  page: state.currentPage,
                  sortField: state.sortField,
                  sortOrder: state.sortOrder,
                  filterNotConnected: state.filterNotConnected,
                }}
              />
            ))}
          </ResponsiveGrid>

          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(state.currentPage - 1)}
                    disabled={state.currentPage === 1 || isFetching}
                  />
                </PaginationItem>

                {getPaginationNumbers().map((page, index) =>
                  page === "..." ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={state.currentPage === page}
                        disabled={isFetching}
                      >
                        <p>{page}</p>
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(state.currentPage + 1)}
                    disabled={state.currentPage === totalPages || isFetching}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </PageHeader>
  );
}

"use client";

import { useEffect, useState } from "react";
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
import { api } from "~/lib/trpc/react";
import { GetOwnImagesInput } from "~/server/api/root";
import { ImageSortField, SortOrder } from "~/types/image";

const ITEMS_PER_PAGE = 4;

export default function AllImagesPage() {
  const [sortField, setSortField] = useState<ImageSortField>(
    ImageSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [filterNotConnected, setFilterNotConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get the utils for accessing the cache
  const utils = api.useUtils();

  // Get the prefetched data from the cache
  const initialData = utils.image.getOwnImages.getData({
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    sortField: ImageSortField.UPLOAD_DATE,
    sortOrder: SortOrder.DESC,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  const { data, isLoading, isFetching, refetch } =
    api.image.getOwnImages.useQuery(
      {
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        sortField,
        sortOrder,
        filterNotConnected,
      } satisfies GetOwnImagesInput,
      {
        initialData: initialData,
        staleTime: 10000,
        // Add this to ensure we update the UI when the query parameters change
        keepPreviousData: false,
      },
    );

  const userImages = data?.images ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Handle sort changes
  const handleSortChange = async (field: ImageSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    await refetch();
  };

  // Handle filter changes
  const handleFilterChange = async (checked: boolean) => {
    setFilterNotConnected(checked);
    setCurrentPage(1); // Reset to first page

    // Invalidate and refetch to ensure we get fresh data with new filter
    await utils.image.getOwnImages.invalidate();
    await refetch();
  };

  // Add an effect to handle page changes when total pages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: number[] = [];
    const showAroundCurrent = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - showAroundCurrent &&
          i <= currentPage + showAroundCurrent)
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

  useEffect(() => {
    console.debug("currentPage: ", currentPage);
    console.debug("totalPages: ", totalPages);
  }, [currentPage, totalPages]);

  return (
    <PageHeader
      title="All Photos"
      subtitle="View and manage your current photos"
      buttonLink="/photos/upload"
      buttonLabel="Upload new photos"
    >
      <ImagesSortFilterControlls
        sortField={sortField}
        sortOrder={sortOrder}
        isFetching={isFetching}
        filterNotConnected={filterNotConnected}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />
      {!isFetching && userImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : isLoading ? (
        <SpinningLoader />
      ) : (
        <>
          <ResponsiveGrid>
            {userImages.map((image) => (
              <PhotoCard image={image} key={image.id} sortField={sortField} />
            ))}
          </ResponsiveGrid>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isFetching}
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
                          isActive={currentPage === page}
                          disabled={isFetching}
                        >
                          <p>{page}</p>
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isFetching}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </PageHeader>
  );
}

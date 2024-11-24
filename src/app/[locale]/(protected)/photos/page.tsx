"use client";

import { useEffect, useState } from "react";
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
  } satisfies GetOwnImagesInput);

  const { data, isLoading, isFetching, refetch } =
    api.image.getOwnImages.useQuery(
      {
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        sortField,
        sortOrder,
      } satisfies GetOwnImagesInput,
      {
        initialData, // Use the prefetched data
      },
    );

  const userImages = data?.images ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / ITEMS_PER_PAGE);

  const filteredUserImages = filterNotConnected
    ? userImages.filter((image) => image.plantImages.length === 0)
    : userImages;

  // Handle sort changes
  const handleSortChange = async (field: ImageSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    // setCurrentPage(1); // Reset to first page when sorting changes
    await refetch();
  };

  // Handle filter changes
  const handleFilterChange = (checked: boolean) => {
    setFilterNotConnected(checked);
    // setCurrentPage(1); // Reset to first page when filter changes
  };

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
        filterNotConnected={filterNotConnected}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />
      {!isFetching && filteredUserImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {filteredUserImages.map((image, key) => (
              <PhotoCard image={image} key={key} sortField={sortField} />
            ))}
          </ResponsiveGrid>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {currentPage !== 1 && (
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    )}
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
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    {currentPage !== totalPages && (
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <p>Loading...</p>
        </div>
      )}
    </PageHeader>
  );
}

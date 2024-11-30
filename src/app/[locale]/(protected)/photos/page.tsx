"use client";

import { useTranslations } from "next-intl";
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
const STALE_TIME = 30000; // 30s

export default function AllImagesPage() {
  // const t = useTranslations("Photos");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<ImageSortField>(
    ImageSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [filterNotConnected, setFilterNotConnected] = useState(false);

  // Get the utils for accessing the cache
  const utils = api.useUtils();

  // Get the prefetched data from the cache
  const prefetchedFromCache = utils.image.getOwnImages.getData({
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Load own images from database
  const { data, isLoading, isFetching } = api.image.getOwnImages.useQuery(
    {
      limit: ITEMS_PER_PAGE,
      page: currentPage,
      sortField,
      sortOrder,
      filterNotConnected,
    } satisfies GetOwnImagesInput,
    {
      initialData: prefetchedFromCache,
      staleTime: STALE_TIME,
    },
  );

  const userImages = data?.images ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Handle sort changes
  const handleSortChange = async (field: ImageSortField, order: SortOrder) => {
    // Update the state
    setSortField(field);
    setSortOrder(order);

    // setCurrentPage(1);
    // await refetch();
  };

  // Handle filter changes
  const handleFilterChange = async (checked: boolean) => {
    // First invalidate the cache for all queries
    // await utils.image.getOwnImages.invalidate();
    setFilterNotConnected(checked);

    setCurrentPage(1);
    // await refetch();
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
    // TODO: translations!
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

          {
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
          }
        </>
      )}
    </PageHeader>
  );
}

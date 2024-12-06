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
import {
  GetOwnImageType,
  GetOwnImagesInput,
  GetOwnImagesOutput,
} from "~/server/api/root";
import { ImageSortField, ImageSortOrder } from "~/types/image";

export default function AllImagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

  // Initialize state from URL query params
  const [cursor, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
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
  const prefetchedImagesFromCache = utils.image.getOwnImages.getData({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    cursor,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Load own images from database
  const { data, isLoading, isFetching } = api.image.getOwnImages.useQuery(
    {
      limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
      cursor,
      sortField,
      sortOrder,
      filterNotConnected,
    } satisfies GetOwnImagesInput,
    {
      initialData: prefetchedImagesFromCache,
    },
  );

  const userImages =
    (data satisfies GetOwnImagesOutput | undefined)?.images ?? [];
  const totalPages =
    (data satisfies GetOwnImagesOutput | undefined)?.total ?? 1;

  // Function to update URL query params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", cursor.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    if (filterNotConnected) {
      params.set("filterNotConnected", "true");
    } else {
      params.delete("filterNotConnected");
    }
    router.push(`?${params.toString()}`);
  }, [cursor, sortField, sortOrder, filterNotConnected, router]);

  // Sync state with URL query params
  useEffect(() => {
    updateUrlParams();
  }, [cursor, sortField, sortOrder, filterNotConnected, updateUrlParams]);

  // Handle sort changes
  const handleSortChange = async (
    field: ImageSortField,
    order: ImageSortOrder,
  ) => {
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
    const showAroundCurrent = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= cursor - showAroundCurrent && i <= cursor + showAroundCurrent)
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
      {!isFetching && userImages.length === 0 ? (
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
            {userImages.map((image) => (
              <PhotoCard
                image={image satisfies GetOwnImageType}
                key={image.id}
                sortField={sortField satisfies ImageSortField}
                currentQuery={{
                  page: cursor,
                  sortField,
                  sortOrder,
                  filterNotConnected,
                }}
              />
            ))}
          </ResponsiveGrid>

          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(cursor - 1)}
                    disabled={cursor === 1 || isFetching}
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
                        isActive={cursor === page}
                        disabled={isFetching}
                      >
                        <p>{page}</p>
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(cursor + 1)}
                    disabled={cursor === totalPages || isFetching}
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

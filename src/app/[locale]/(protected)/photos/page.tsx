"use client";

// src/app/[locale]/(protected)/photos/page.tsx:
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
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
  GetOwnImagesType,
} from "~/server/api/root";
import {
  PhotosSortField,
  PhotosSortOrder,
  PhotosViewMode,
} from "~/types/image";

export default function AllImagesPage() {
  const searchParams = useSearchParams();

  // Manage view mode state
  const [viewMode, setViewMode] = useState<PhotosViewMode>(
    (localStorage.getItem("photoViewMode") as PhotosViewMode) ||
      PhotosViewMode.PAGINATION,
  );

  // Shared state for sorting and filtering
  const [sortField, setSortField] = useState<PhotosSortField>(
    (searchParams.get("sortField") as PhotosSortField) ||
      PhotosSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<PhotosSortOrder>(
    (searchParams.get("sortOrder") as PhotosSortOrder) || PhotosSortOrder.DESC,
  );
  const [filterNotConnected, setFilterNotConnected] = useState(
    searchParams.get("filterNotConnected") === "true",
  );

  // Toggle view mode function
  const toggleViewMode = () => {
    const newMode =
      viewMode === PhotosViewMode.PAGINATION
        ? PhotosViewMode.INFINITE_SCROLL
        : PhotosViewMode.PAGINATION;

    localStorage.setItem("photoViewMode", newMode);
    setViewMode(newMode);
  };

  // Shared handler for sort changes
  // const handleSortChange = (field: ImageSortField, order: ImageSortOrder) => {
  //   setSortField(field);
  //   setSortOrder(order);
  // };
  const handleSortChange = async (
    field: PhotosSortField,
    order: PhotosSortOrder,
  ) => {
    setSortField(field);
    setSortOrder(order);
    // If you need to perform any async operations, do them here
    // Otherwise, you can simply return a resolved promise
    return Promise.resolve();
  };

  // Shared handler for filter changes
  const handleFilterChange = (checked: boolean) => {
    setFilterNotConnected(checked);
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
        filterNotConnected={filterNotConnected}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        isFetching={false}
        toggleViewMode={toggleViewMode}
        viewMode={viewMode}
      />

      {viewMode === PhotosViewMode.PAGINATION ? (
        <PaginatedView
          sortField={sortField}
          sortOrder={sortOrder}
          filterNotConnected={filterNotConnected}
        />
      ) : (
        <InfiniteScrollView
          sortField={sortField}
          sortOrder={sortOrder}
          filterNotConnected={filterNotConnected}
        />
      )}
    </PageHeader>
  );
}

// Pagination View Component
function PaginatedView({
  sortField,
  sortOrder,
  filterNotConnected,
}: {
  sortField: PhotosSortField;
  sortOrder: PhotosSortOrder;
  filterNotConnected: boolean;
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const [page, setCurrentPage] = useState(1);

  // Function to update URL query params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    if (filterNotConnected) {
      params.set("filterNotConnected", "true");
    } else {
      params.delete("filterNotConnected");
    }
    router.push(`?${params.toString()}`);
  }, [page, sortField, sortOrder, filterNotConnected, router]);

  // Sync state with URL query params
  useEffect(() => {
    updateUrlParams();
  }, [page, sortField, sortOrder, filterNotConnected, updateUrlParams]);

  // Prefetch data
  const prefetchedImagesFromCache = utils.image.getOwnImages.getData({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    cursor: page,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Query images
  const { data, isLoading, isFetching } = api.image.getOwnImages.useQuery(
    {
      limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
      cursor: page,
      sortField,
      sortOrder,
      filterNotConnected,
    } satisfies GetOwnImagesInput,
    {
      initialData: prefetchedImagesFromCache,
    },
  );

  const userImages = data?.images ?? [];
  const totalPages = data?.total ?? 1;

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
        (i >= page - showAroundCurrent && i <= page + showAroundCurrent)
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
    <>
      {isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : userImages.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userImages.map((image) => (
              <PhotoCard
                key={image.id}
                image={image satisfies GetOwnImageType}
                sortField={sortField}
                currentQuery={{
                  page: page,
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
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isFetching}
                  />
                </PaginationItem>

                {getPaginationNumbers().map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber as number)}
                        isActive={pageNumber === page} // Changed to compare with the current page
                        disabled={isFetching}
                      >
                        <p>{pageNumber}</p>
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || isFetching}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </>
  );
}

// Infinite Scroll View Component
function InfiniteScrollView({
  sortField,
  sortOrder,
  filterNotConnected,
}: {
  sortField: PhotosSortField;
  sortOrder: PhotosSortOrder;
  filterNotConnected: boolean;
}) {
  const router = useRouter();
  const utils = api.useUtils();

  useEffect(() => {
    router.replace(
      modulePaths.PHOTOS.path, // Use only the base path
    );
  }, [router]);

  // Get initial data from cache
  const initialData = utils.image.getOwnImages.getInfiniteData({
    // the input must match the server-side `prefetchInfinite`
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Infinite query
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

  // Extract photos from pages
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

  return (
    <>
      {isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : photos.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {filterNotConnected
            ? "No images without connected plants have been found."
            : "You haven't uploaded any images yet."}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {photos.map((image) => (
              <PhotoCard
                key={image.id}
                image={image satisfies GetOwnImageType}
                sortField={sortField}
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

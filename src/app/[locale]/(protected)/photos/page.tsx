"use client";

import {
  Infinity,
  ArrowDown01,
  ArrowDown10,
  Camera,
  UploadCloud,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import PhotoCard from "~/components/features/Photos/photo-card";
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
import { PhotosSortField, PhotosViewMode } from "~/types/image";

export default function AllImagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Manage view mode state
  const [viewMode, setViewMode] = useState<string>(
    (localStorage.getItem("photoViewMode") as PhotosViewMode) ||
      PhotosViewMode.PAGINATION,
  );

  // Shared state for sorting and filtering
  const [sortField, setSortField] = useState<PhotosSortField>(
    (searchParams.get("sortField") as PhotosSortField) ||
      PhotosSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get("sortOrder") as SortOrder) || SortOrder.DESC,
  );
  const [filterNotConnected, setFilterNotConnected] = useState(
    searchParams.get("filterNotConnected") === "true",
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", searchParams.get("page") || "1");
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    params.set("filterNotConnected", filterNotConnected.toString());
    router.push(`?${params.toString()}`);
  }, [searchParams, sortField, sortOrder, filterNotConnected, router]);

  // Sync state with URL
  useEffect(() => {
    updateUrlParams();
  }, [sortField, sortOrder, filterNotConnected, updateUrlParams]);

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
  const handleSortChange = (field: PhotosSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Shared handler for filter changes
  const handleFilterChange = (checked: boolean) => {
    setFilterNotConnected(checked);
  };

  // Define sort options
  const sortOptions = [
    {
      field: PhotosSortField.UPLOAD_DATE,
      label: "Upload Date",
      icon: <UploadCloud className="h-6 w-5" />,
      sortIconAsc: ArrowDown01,
      sortIconDesc: ArrowDown10,
    },
    {
      field: PhotosSortField.CAPTURE_DATE,
      label: "Capture Date",
      icon: <Camera className="h-6 w-5" />,
      sortIconAsc: ArrowDown01,
      sortIconDesc: ArrowDown10,
    },
  ];

  return (
    <PageHeader
      title="My Photos"
      subtitle="View and manage your photos"
      buttonLink="/photos/upload"
      buttonLabel="Upload new Photos"
    >
      <SortFilterControls
        sortField={sortField}
        sortOrder={sortOrder}
        sortOptions={sortOptions}
        filterEnabled={filterNotConnected}
        filterLabel="New only"
        isFetching={isFetching}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        viewMode={{
          current: viewMode,
          options: [PhotosViewMode.PAGINATION, PhotosViewMode.INFINITE_SCROLL],
          label: "Scroll",
          icon: <Infinity className="mr-2 h-4 w-4" />,
        }}
        onViewModeToggle={toggleViewMode}
      />

      {viewMode === PhotosViewMode.PAGINATION ? (
        <PaginatedView
          sortField={sortField}
          sortOrder={sortOrder}
          filterNotConnected={filterNotConnected}
          setIsFetching={setIsFetching}
        />
      ) : (
        <InfiniteScrollView
          sortField={sortField}
          sortOrder={sortOrder}
          filterNotConnected={filterNotConnected}
          setIsFetching={setIsFetching}
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
  setIsFetching,
}: {
  sortField: PhotosSortField;
  sortOrder: SortOrder;
  filterNotConnected: boolean;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );

  // Function to update URL query params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    params.set("filterNotConnected", filterNotConnected.toString());
    router.push(`?${params.toString()}`);
  }, [currentPage, sortField, sortOrder, filterNotConnected, router]);

  // Sync state with URL query params
  useEffect(() => {
    updateUrlParams();
  }, [currentPage, sortField, sortOrder, filterNotConnected, updateUrlParams]);

  // Get initial data from cache
  const initialData = utils.image.getOwnImages.getData({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    cursor: currentPage,
    sortField,
    sortOrder,
    filterNotConnected,
  } satisfies GetOwnImagesInput);

  // Query images
  const { data, isLoading, isFetching } = api.image.getOwnImages.useQuery(
    {
      limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
      cursor: currentPage,
      sortField,
      sortOrder,
      filterNotConnected,
    } satisfies GetOwnImagesInput,
    {
      initialData,
    },
  );
  // Directly update the parent's isFetching state
  useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

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
                  page: currentPage,
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
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isFetching}
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
                        isActive={pageNumber === currentPage} // Changed to compare with the current page
                        disabled={isFetching}
                      >
                        <p>{pageNumber}</p>
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
  setIsFetching,
}: {
  sortField: PhotosSortField;
  sortOrder: SortOrder;
  filterNotConnected: boolean;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
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
  // Directly update the parent's isFetching state
  useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

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

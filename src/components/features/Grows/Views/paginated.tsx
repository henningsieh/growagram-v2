"use client";

// src/components/features/Grows/Views/paginated.tsx:
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GrowCard } from "~/components/features/Grows/grow-card";
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
import { GetOwnGrowsInput } from "~/server/api/root";
import { GrowsSortField } from "~/types/grow";

export default function PaginatedGrowsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: GrowsSortField;
  sortOrder: SortOrder;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

  // Initialize state from URL query params
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get("page") || "1"),
  );

  // Function to update URL query params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    router.push(`?${params.toString()}`);
  }, [currentPage, sortField, sortOrder, router]);

  // Sync state with URL query params
  useEffect(() => {
    updateUrlParams();
  }, [currentPage, sortField, sortOrder, updateUrlParams]);

  // Get initial data from cache
  const initialData = utils.grows.getOwnGrows.getData({
    cursor: currentPage,
    limit: PaginationItemsPerPage.GROWS_PER_PAGE,
    sortField,
    sortOrder,
  } satisfies GetOwnGrowsInput);

  // Query grows
  const { data, isLoading, isFetching } = api.grows.getOwnGrows.useQuery(
    {
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      cursor: currentPage,
      sortField,
      sortOrder,
    } satisfies GetOwnGrowsInput,
    {
      initialData,
    },
  );

  // Directly update the parent's isFetching state
  useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  const userGrows = data?.grows ?? [];
  const totalPages = data?.totalPages ?? 1;

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

  return (
    <>
      {isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : userGrows.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No grows have been created yet.
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userGrows.map((grow) => (
              <GrowCard key={grow.id} grow={grow} isSocial={false} />
            ))}
          </ResponsiveGrid>

          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="icon"
                    className="p-0"
                    children={<ChevronLeftIcon className="h-4 w-4" />} // Previous
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
                    size="icon"
                    className="p-0"
                    children={<ChevronRightIcon className="h-4 w-4" />} // Next
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

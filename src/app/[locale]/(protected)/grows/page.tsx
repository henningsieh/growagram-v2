"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
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

export default function MyGrowsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL query params
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );

  const utils = api.useUtils();

  // Get the prefetched data from the cache
  const prefetchedFromCache = utils.grow.getOwnGrows.getData({
    page: currentPage,
    limit: PaginationItemsPerPage.GROWS_PER_PAGE,
  });

  // Load own grows from database
  const { data, isLoading, isFetching } = api.grow.getOwnGrows.useQuery(
    {
      page: currentPage,
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
    },
    {
      initialData: prefetchedFromCache,
    },
  );

  const userGrows = data?.grows ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    router.push(`?${params.toString()}`);
  }, [currentPage, router]);

  // Sync state with URL
  useEffect(() => {
    updateUrlParams();
  }, [currentPage, updateUrlParams]);

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
    <PageHeader
      title="My Grows"
      subtitle="View and manage your current grows"
      buttonLink="/grows/create"
      buttonLabel="Create New Grow"
    >
      {!isFetching && userGrows.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          You haven&apos;t created any grow environments yet.
        </p>
      ) : isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : (
        <>
          <ResponsiveGrid>
            {userGrows.map((grow) => (
              <GrowCard key={grow.id} grow={grow} showUnassignButton={false} />
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
        </>
      )}
    </PageHeader>
  );
}

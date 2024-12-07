"use client";

// src/app/[locale]/(protected)/grows/page.tsx:
import {
  Infinity,
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownZA,
  Calendar,
  Tag,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
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
import { GrowsSortField, GrowsViewMode } from "~/types/grow";

export default function MyGrowsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL query params
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );

  // State for sorting
  const [sortField, setSortField] = useState<GrowsSortField>(
    GrowsSortField.NAME,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  const [viewMode, setViewMode] = useState<GrowsViewMode>(
    GrowsViewMode.PAGINATION,
  );

  const utils = api.useUtils();

  const queryObject = {
    cursor: currentPage,
    limit: PaginationItemsPerPage.GROWS_PER_PAGE,
    sortField,
    sortOrder,
  } satisfies GetOwnGrowsInput;

  // Get the prefetched data from the cache
  const initialData = utils.grow.getOwnGrows.getData(queryObject);

  // Load own grows from database
  const { data, isLoading, isFetching } = api.grow.getOwnGrows.useQuery(
    queryObject,
    {
      initialData,
    },
  );

  const userGrows = data?.grows ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    router.push(`?${params.toString()}`);
  }, [currentPage, router, sortField, sortOrder]);

  // Sync state with URL
  useEffect(() => {
    updateUrlParams();
  }, [currentPage, sortField, sortOrder, updateUrlParams]);

  // Handle sorting changes
  const handleSortChange = (field: GrowsSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const sortOptions = [
    {
      field: GrowsSortField.NAME,
      label: "Name",
      icon: <Tag className="h-6 w-5" />,
      sortIconAsc: ArrowDownAZ,
      sortIconDesc: ArrowDownZA,
    },
    {
      field: GrowsSortField.CREATED_AT,
      label: "Created Date",
      icon: <Calendar className="h-6 w-5" />,
      sortIconAsc: ArrowDown01,
      sortIconDesc: ArrowDown10,
    },
  ];

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

  const t = useTranslations("Grows");

  return (
    <PageHeader
      title="My Grows"
      subtitle="View and manage your current grows"
      buttonLink="/grows/new/form"
      buttonLabel="Create New Grow"
    >
      {/* Sorting controls */}
      <SortFilterControls
        isFetching={isFetching}
        sortField={sortField}
        sortOrder={sortOrder}
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
        filterLabel={undefined}
        filterEnabled={undefined}
        onFilterChange={undefined}
        viewMode={{
          current: viewMode,
          options: [GrowsViewMode.PAGINATION, GrowsViewMode.INFINITE_SCROLL],
          label: "Scroll",
          icon: <Infinity className="mr-2 h-4 w-4" />,
        }}
        onViewModeToggle={() =>
          setViewMode(
            viewMode === GrowsViewMode.PAGINATION
              ? GrowsViewMode.INFINITE_SCROLL
              : GrowsViewMode.PAGINATION,
          )
        }
      />

      {!isFetching && userGrows.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {t("no-grows-yet")}
        </p>
      ) : isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : (
        <>
          <ResponsiveGrid>
            {userGrows.map((grow) => (
              <GrowCard key={grow.id} grow={grow} />
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

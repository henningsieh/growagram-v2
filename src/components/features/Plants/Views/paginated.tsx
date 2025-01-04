"use client";

// src/components/features/Plants/Views/paginated.tsx:
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
import { GetOwnPlantsInput } from "~/server/api/root";
import { PlantsSortField } from "~/types/plant";

import PlantCard from "../plant-card";

export default function PaginatedPlantsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: PlantsSortField;
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
  const initialData = utils.plants.getOwnPlants.getData({
    cursor: currentPage,
    limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
    sortField,
    sortOrder,
  } satisfies GetOwnPlantsInput);

  // Query plants
  const { data, isLoading, isFetching } = api.plants.getOwnPlants.useQuery(
    {
      limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
      cursor: currentPage,
      sortField,
      sortOrder,
    } satisfies GetOwnPlantsInput,
    {
      initialData,
    },
  );

  // Directly update the parent's isFetching state
  useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  const userPlants = data?.plants ?? [];
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
      ) : userPlants.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No plants have been created yet.
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} isSocialProp={false} />
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
    </>
  );
}

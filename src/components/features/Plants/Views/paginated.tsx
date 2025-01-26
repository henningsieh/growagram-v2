"use client";

// src/components/features/Plants/Views/paginated.tsx:
import { useSearchParams } from "next/navigation";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type { GetOwnPlantsInput } from "~/server/api/root";
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

          <ItemsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            isFetching={isFetching}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

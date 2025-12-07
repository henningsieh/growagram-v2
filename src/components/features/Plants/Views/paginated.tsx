"use client";

// src/components/features/Plants/Views/paginated.tsx:
import * as React from "react";

import { useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";

import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import PlantCard from "~/components/features/Plants/plant-card";

import type { GetOwnPlantsInput } from "~/server/api/root";

import { PlantsSortField } from "~/types/plant";

import { useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";

import { PaginationItemsPerPage } from "~/assets/constants";

export default function PaginatedPlantsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: PlantsSortField;
  sortOrder: SortOrder;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("Plants");

  // Initialize state from URL query params
  const [currentPage, setCurrentPage] = React.useState(
    parseInt(searchParams?.get("page") || "1"),
  );

  // Function to update URL query params
  const updateUrlParams = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    router.push(`?${params.toString()}`);
  }, [currentPage, sortField, sortOrder, router]);

  // Sync state with URL query params
  React.useEffect(() => {
    updateUrlParams();
  }, [currentPage, sortField, sortOrder, updateUrlParams]);

  // Get initial data from cache
  const initialData = queryClient.getQueryData(
    trpc.plants.getOwnPlants.queryKey({
      cursor: currentPage,
      limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
      sortField,
      sortOrder,
    } satisfies GetOwnPlantsInput),
  );

  // Query plants
  const { data, isLoading, isFetching } = useQuery(
    trpc.plants.getOwnPlants.queryOptions(
      {
        limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
        cursor: currentPage,
        sortField,
        sortOrder,
      } satisfies GetOwnPlantsInput,
      {
        initialData,
      },
    ),
  );

  // Directly update the parent's isFetching state
  React.useEffect(() => {
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
        <p className="text-muted-foreground mt-8 text-center">
          {t("no-plants-yet")}
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

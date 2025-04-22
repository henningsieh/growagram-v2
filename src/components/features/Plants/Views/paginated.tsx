// src/components/features/Plants/Views/paginated.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseQuery } from "@tanstack/react-query";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import PlantCard from "~/components/features/Plants/plant-card";
import { getOwnPlantsInput } from "~/lib/queries/plants";
import type { GetOwnPlantsInput } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { PlantsSortField } from "~/types/plant";

interface PaginatedPlantsViewProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  sortField: PlantsSortField;
  sortOrder: SortOrder;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PaginatedPlantsView({
  currentPage: cursor,
  onPageChange,
  sortField,
  sortOrder,
  setIsFetching,
}: PaginatedPlantsViewProps) {
  const trpc = useTRPC();
  const t = useTranslations("Plants");

  const plantsQuery = useSuspenseQuery(
    trpc.plants.getOwnPlants.queryOptions({
      ...getOwnPlantsInput,
      cursor: cursor,
      sortField: sortField,
      sortOrder: sortOrder,
    } satisfies GetOwnPlantsInput),
  );

  // Extract plants data
  const { plants, totalPages } = plantsQuery.data;

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(plantsQuery.isFetching);
  }, [plantsQuery.isFetching, setIsFetching]);

  return (
    <>
      {plants.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {t("no-plants-yet")}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} isSocialProp={false} />
            ))}
          </ResponsiveGrid>

          <ItemsPagination
            currentPage={cursor}
            totalPages={totalPages}
            isFetching={plantsQuery.isFetching}
            handlePageChange={onPageChange}
          />
        </>
      )}
    </>
  );
}

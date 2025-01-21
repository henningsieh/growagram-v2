// src/app/[locale]/(protected)/plants/layout.tsx:
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { HydrateClient } from "~/lib/trpc/server";
import { api } from "~/lib/trpc/server";
import { GetOwnPlantsInput } from "~/server/api/root";
import { PlantsSortField } from "~/types/plant";

export const metadata = {
  title: "Grower's Plattform | My Plants",
  description: "Grower's Plattform | My Plants",
};

export default async function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page

  await api.plants.getOwnPlants.prefetchInfinite({
    cursor: 1,
    limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
    sortField: PlantsSortField.NAME,
    sortOrder: SortOrder.ASC,
  } satisfies GetOwnPlantsInput);

  await api.plants.getOwnPlants.prefetch({
    cursor: 1,
    limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
    sortField: PlantsSortField.NAME,
    sortOrder: SortOrder.ASC,
  } satisfies GetOwnPlantsInput);

  return <HydrateClient>{children}</HydrateClient>;
}

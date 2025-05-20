// src/app/[locale]/(protected)/plants/layout.tsx:
import { getTranslations } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import type { GetOwnPlantsInput } from "~/server/api/root";
import { PlantsSortField } from "~/types/plant";

export async function generateMetadata() {
  const t = await getTranslations("Navigation");
  return {
    title: `${t("grower-menu")} | ${t("my-plants")}`,
    description: t("my-plants-subline"),
  };
}

export default async function MyPlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultSortField = PlantsSortField.NAME;
  const defaultSortOrder = SortOrder.ASC;
  const defaultLimit = PaginationItemsPerPage.PLANTS_PER_PAGE;

  // Prefetch data for InfiniteScrollPlantsView (initial load)
  await queryClient.prefetchInfiniteQuery(
    trpc.plants.getOwnPlants.infiniteQueryOptions(
      {
        limit: defaultLimit,
        sortField: defaultSortField,
        sortOrder: defaultSortOrder,
      } satisfies GetOwnPlantsInput,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  // Prefetch data for PaginatedPlantsView (default first page)
  await queryClient.prefetchQuery(
    trpc.plants.getOwnPlants.queryOptions({
      cursor: 1, // Default to page 1
      limit: defaultLimit,
      sortField: defaultSortField,
      sortOrder: defaultSortOrder,
    } satisfies GetOwnPlantsInput),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

// src/app/[locale]/(protected)/grows/layout.tsx:
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import type { GetOwnGrowsInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";
import { GrowsSortField } from "~/types/grow";

export const metadata = {
  title: "Grower's Plattform | My Grows",
  description: "Grower's Plattform | My Grows",
};

export default function MyGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page

  const queryClient = getQueryClient();

  void queryClient.prefetchInfiniteQuery(
    trpc.grows.getOwnGrows.infiniteQueryOptions({
      cursor: 1,
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      sortField: GrowsSortField.NAME,
      sortOrder: SortOrder.ASC,
    } satisfies GetOwnGrowsInput),
  );

  void queryClient.prefetchQuery(
    trpc.grows.getOwnGrows.queryOptions({
      cursor: 1,
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      sortField: GrowsSortField.NAME,
      sortOrder: SortOrder.ASC,
    } satisfies GetOwnGrowsInput),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

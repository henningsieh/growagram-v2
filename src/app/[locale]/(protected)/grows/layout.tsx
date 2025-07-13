// src/app/[locale]/(protected)/grows/layout.tsx:
import { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import { generatePageMetadata } from "~/lib/utils/metadata";
import type { GetOwnGrowsInput } from "~/server/api/root";
import { GrowsSortField } from "~/types/grow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata("grows", locale);
}

export default async function MyGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultSortField = GrowsSortField.NAME;
  const defaultSortOrder = SortOrder.ASC;
  const defaultLimit = PaginationItemsPerPage.GROWS_PER_PAGE;

  // Prefetch data for InfiniteScrollGrowsView (initial load)
  await queryClient.prefetchInfiniteQuery(
    trpc.grows.getOwnGrows.infiniteQueryOptions(
      {
        limit: defaultLimit,
        sortField: defaultSortField,
        sortOrder: defaultSortOrder,
      } satisfies GetOwnGrowsInput,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  // Prefetch data for PaginatedGrowsView (default first page)
  await queryClient.prefetchQuery(
    trpc.grows.getOwnGrows.queryOptions({
      cursor: 1, // Default to page 1
      limit: defaultLimit,
      sortField: defaultSortField,
      sortOrder: defaultSortOrder,
    } satisfies GetOwnGrowsInput),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { parseAsString } from "nuqs/server";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { ExploreGrowsClient } from "~/components/features/Exploration/explore-grows-client";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import type { ExploreGrowsInput } from "~/server/api/root";
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
  GrowsSortField,
} from "~/types/grow";

interface ExploreGrowsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExploreGrowsPage({
  searchParams,
}: ExploreGrowsPageProps) {
  const queryClient = getQueryClient();
  const resolvedSearchParams = await searchParams;

  /**
   * Parse search parameters using nuqs/server - same logic as client side
   * search: general search term for grow names
   * username: specific username filter (extracted from @username in search input)
   */
  const search = parseAsString.parseServerSide(resolvedSearchParams.search);
  const username = parseAsString.parseServerSide(resolvedSearchParams.username);
  const environment = parseAsString.parseServerSide(
    resolvedSearchParams.environment,
  );
  const cultureMedium = parseAsString.parseServerSide(
    resolvedSearchParams.cultureMedium,
  );
  const fertilizerType = parseAsString.parseServerSide(
    resolvedSearchParams.fertilizerType,
  );
  const fertilizerForm = parseAsString.parseServerSide(
    resolvedSearchParams.fertilizerForm,
  );
  const sortField = parseAsString.parseServerSide(
    resolvedSearchParams.sortField,
  );
  const sortOrder = parseAsString.parseServerSide(
    resolvedSearchParams.sortOrder,
  );

  // Transform URL filters to API format - exactly matching client-side logic
  const exploreFilters: ExploreGrowsInput = {
    search: search || undefined,
    username: username || undefined,
    environment: environment ? (environment as GrowEnvironment) : undefined,
    cultureMedium: cultureMedium ? (cultureMedium as CultureMedium) : undefined,
    fertilizerType: fertilizerType
      ? (fertilizerType as FertilizerType)
      : undefined,
    fertilizerForm: fertilizerForm
      ? (fertilizerForm as FertilizerForm)
      : undefined,
    sortField: (sortField as GrowsSortField) || GrowsSortField.UPDATED_AT,
    sortOrder: (sortOrder as SortOrder) || SortOrder.DESC,
    limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
  };

  // Prefetch data with the same filters that will be used on the client
  // Using await to ensure content is available for crawlers and SEO
  await queryClient.prefetchInfiniteQuery(
    trpc.grows.explore.infiniteQueryOptions(exploreFilters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExploreGrowsClient />
    </HydrationBoundary>
  );
}

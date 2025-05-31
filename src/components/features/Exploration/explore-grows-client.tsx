"use client";

import * as React from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
import { PaginationItemsPerPage } from "~/assets/constants";
import { GenericError } from "~/components/atom/generic-error";
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
} from "~/types/grow";
import { ExploreGrowsGrid } from "./explore-grows-grid";
import { ExploreGrowsLoading } from "./explore-grows-loading";

export function ExploreGrowsClient() {
  // Get filter state from URL query parameters
  const [filters] = useQueryStates({
    search: parseAsString.withDefault(""),
    environment: parseAsString,
    cultureMedium: parseAsString,
    fertilizerType: parseAsString,
    fertilizerForm: parseAsString,
  });

  // Transform URL filters to API format - same logic as server-side
  const exploreFilters = {
    search: filters.search || undefined,
    environment: filters.environment
      ? (filters.environment as GrowEnvironment)
      : undefined,
    cultureMedium: filters.cultureMedium
      ? (filters.cultureMedium as CultureMedium)
      : undefined,
    fertilizerType: filters.fertilizerType
      ? (filters.fertilizerType as FertilizerType)
      : undefined,
    fertilizerForm: filters.fertilizerForm
      ? (filters.fertilizerForm as FertilizerForm)
      : undefined,
    limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
  };

  return (
    <ErrorBoundary FallbackComponent={GenericError}>
      <React.Suspense fallback={<ExploreGrowsLoading />}>
        <ExploreGrowsGrid filters={exploreFilters} />
      </React.Suspense>
    </ErrorBoundary>
  );
}

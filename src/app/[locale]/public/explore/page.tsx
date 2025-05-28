// src/app/[locale]/public/explore/page.tsx
"use client";

import { parseAsString, useQueryStates } from "nuqs";
import { ExploreGrowsGrid } from "~/components/features/Exploration/explore-grows-grid";
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
} from "~/types/grow";

// src/app/[locale]/public/explore/page.tsx

export default function ExplorePage() {
  // Get filter state from URL query parameters
  const [filters] = useQueryStates({
    search: parseAsString.withDefault(""),
    environment: parseAsString,
    cultureMedium: parseAsString,
    fertilizerType: parseAsString,
    fertilizerForm: parseAsString,
  });

  // Transform URL filters to API format
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
    limit: 12, // Default items per page for exploration
  };

  return <ExploreGrowsGrid filters={exploreFilters} />;
}

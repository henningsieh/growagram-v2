// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import * as React from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import type { GetPlantByIdInput } from "~/server/api/root";
import { getCaller, getQueryClient, trpc } from "~/trpc/server";
import { PlantsSortField } from "~/types/plant";

export const metadata = {
  title: "Grower's Plattform | Plants",
  description: "Grower's Plattform | Plants",
};

// Allow both static and dynamic rendering
export const dynamic = "force-dynamic";
// Revalidate cache every minute
export const revalidate = 60;
// Enable dynamic parameters
export const dynamicParams = true;

// Pre-generate pages for all plants using tRPC caller instead of direct DB queries
export async function generateStaticParams() {
  const caller = await getCaller();
  try {
    // Using the tRPC server caller to fetch all plants with minimal data
    const allPlantsResult = await caller.plants.getAllPlants({
      cursor: 1,
      limit: PaginationItemsPerPage.MAX_DEFAULT_ITEMS,
      sortOrder: SortOrder.DESC,
      sortField: PlantsSortField.CREATED_AT,
    });

    // Map plants to the expected format
    return allPlantsResult.plants.map((plant) => ({
      id: plant.id,
    })) satisfies GetPlantByIdInput[];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function PublicPlantByIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetPlantByIdInput>;
}) {
  const queryClient = getQueryClient();

  const plantByIdQueryOptions = {
    id: (await params).id,
  } satisfies GetPlantByIdInput;

  // Prefetch plant data
  await queryClient.prefetchQuery({
    ...trpc.plants.getById.queryOptions(plantByIdQueryOptions),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

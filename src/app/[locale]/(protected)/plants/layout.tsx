// src/app/[locale]/(protected)/plants/layout.tsx:
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getOwnPlantsInput } from "~/lib/queries/plants";
import type { GetOwnPlantsInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Grower's Platform | My Plants",
  description: "Grower's Platform | My Plants",
};
export const dynamic = "force-dynamic";

export default async function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    ...trpc.plants.getOwnPlants.infiniteQueryOptions(
      getOwnPlantsInput satisfies GetOwnPlantsInput,
    ),
  });

  await queryClient.prefetchQuery({
    ...trpc.plants.getOwnPlants.queryOptions(
      getOwnPlantsInput satisfies GetOwnPlantsInput,
    ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import type { GetAllPlantsInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Public Plants",
  description: "Explore Public Plants",
};

export default async function PublicPlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Prefetch infinite query data on the server
  await queryClient.prefetchInfiniteQuery(
    trpc.plants.getAllPlants.infiniteQueryOptions({
      limit: PaginationItemsPerPage.PUBLIC_PLANTS_PER_PAGE,
    } satisfies GetAllPlantsInput),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

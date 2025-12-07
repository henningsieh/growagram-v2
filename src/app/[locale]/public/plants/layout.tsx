import { Metadata } from "next";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import type { GetAllPlantsInput } from "~/server/api/root";

import { getQueryClient, trpc } from "~/lib/trpc/server";
import { generatePageMetadata } from "~/lib/utils/metadata";

import { PaginationItemsPerPage } from "~/assets/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata("plants", locale);
}

export default async function PublicPlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Prefetch public plants data with exact same config as page component
  await queryClient.prefetchInfiniteQuery(
    trpc.plants.getAllPlants.infiniteQueryOptions(
      {
        limit: PaginationItemsPerPage.PUBLIC_PLANTS_PER_PAGE,
      } satisfies GetAllPlantsInput,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

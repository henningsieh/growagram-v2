// src/app/[locale]/public/grows/layout.tsx:
import { Metadata } from "next";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import type { GetAllGrowsInput } from "~/server/api/root";

import { getQueryClient, trpc } from "~/lib/trpc/server";
import { generatePageMetadata } from "~/lib/utils/metadata";

import { PaginationItemsPerPage } from "~/assets/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata("grows", locale);
}

export default async function PublicGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Prefetch public grows data with exact same config as page component
  await queryClient.prefetchInfiniteQuery(
    trpc.grows.getAllGrows.infiniteQueryOptions(
      {
        limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
      } satisfies GetAllGrowsInput,
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

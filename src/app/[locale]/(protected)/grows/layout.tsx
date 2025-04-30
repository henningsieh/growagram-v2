// src/app/[locale]/(protected)/grows/layout.tsx:
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getOwnGrowsInput } from "~/lib/queries/grows";
import type { GetOwnGrowsInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Grower's Platform | My Grows",
  description: "Grower's Platform | My Grows",
};
export const dynamic = "force-dynamic";

export default async function MyGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    ...trpc.grows.getOwnGrows.infiniteQueryOptions(
      getOwnGrowsInput satisfies GetOwnGrowsInput,
    ),
  });

  await queryClient.prefetchQuery({
    ...trpc.grows.getOwnGrows.queryOptions(
      getOwnGrowsInput satisfies GetOwnGrowsInput,
    ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ErrorBoundary } from "~/components/atom/error-boundary";
import SpinningLoader from "~/components/atom/spinning-loader";
import { getAllPlantsInput } from "~/lib/queries/plants";
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

  // Prefetch infinite query data on the server with specific sort order
  await queryClient.prefetchInfiniteQuery({
    ...trpc.plants.getAllPlants.infiniteQueryOptions(
      getAllPlantsInput satisfies GetAllPlantsInput,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary>
        <Suspense
          fallback={<SpinningLoader className="text-primary mx-auto my-8" />}
        >
          {children}
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}

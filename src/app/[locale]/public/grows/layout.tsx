import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ErrorBoundary } from "~/components/atom/error-boundary";
import SpinningLoader from "~/components/atom/spinning-loader";
import { getAllGrowsInput } from "~/lib/queries/grows";
import type { GetAllGrowsInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Public Grows",
  description: "Explore Public Grows",
};

export default async function PublicGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Prefetch infinite query data on the server with specific sort order
  await queryClient.prefetchInfiniteQuery({
    ...trpc.grows.getAllGrows.infiniteQueryOptions(
      getAllGrowsInput satisfies GetAllGrowsInput,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
    // initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary>
        <Suspense
          fallback={<SpinningLoader className="text-secondary mx-auto my-8" />}
        >
          {children}
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}

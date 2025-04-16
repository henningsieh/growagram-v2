import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import type { GetAllGrowsInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Public Grows",
  description: "Explore Public Grows",
};

export default function PublicGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  void queryClient.prefetchInfiniteQuery(
    trpc.grows.getAllGrows.infiniteQueryOptions({
      limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
    } satisfies GetAllGrowsInput),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

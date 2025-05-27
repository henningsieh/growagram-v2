import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { getQueryClient, trpc } from "~/lib/trpc/server";

export const metadata = {
  title: "Following Timeline",
  description: "Updates from growers you follow",
};

export default async function FollowingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultFollowingTimelineLimit =
    PaginationItemsPerPage.FOLLOWING_TIMELINE_PER_PAGE;
  const defaultPublicTimelineLimit =
    PaginationItemsPerPage.PUBLIC_TIMELINE_PER_PAGE;

  // Prefetch following timeline data (infinite query) - this is the primary data for this page
  await queryClient.prefetchInfiniteQuery(
    trpc.posts.getFollowingTimeline.infiniteQueryOptions(
      { limit: defaultFollowingTimelineLimit },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  // Also prefetch public timeline data for when users switch tabs
  await queryClient.prefetchInfiniteQuery(
    trpc.posts.getPublicTimeline.infiniteQueryOptions(
      { limit: defaultPublicTimelineLimit },
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

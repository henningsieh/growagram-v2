import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { getQueryClient, trpc } from "~/lib/trpc/server";

export const metadata = {
  title: "Public Timeline",
  description: "Explore public updates from the community",
};

export default async function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultPublicTimelineLimit =
    PaginationItemsPerPage.PUBLIC_TIMELINE_PER_PAGE;
  const defaultFollowingTimelineLimit =
    PaginationItemsPerPage.FOLLOWING_TIMELINE_PER_PAGE;

  // Prefetch public timeline data (infinite query)
  await queryClient.prefetchInfiniteQuery(
    trpc.posts.getPublicTimeline.infiniteQueryOptions(
      { limit: defaultPublicTimelineLimit },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  // Prefetch following timeline data (infinite query)
  await queryClient.prefetchInfiniteQuery(
    trpc.posts.getFollowingTimeline.infiniteQueryOptions(
      { limit: defaultFollowingTimelineLimit },
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

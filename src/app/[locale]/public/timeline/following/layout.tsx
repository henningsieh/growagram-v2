// src/app/[locale]/public/timeline/following/layout.tsx:
import { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import { generatePageMetadata } from "~/lib/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("following");
}

export default async function FollowingTimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultFollowingTimelineLimit =
    PaginationItemsPerPage.FOLLOWING_TIMELINE_PER_PAGE;

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

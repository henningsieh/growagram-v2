// src/app/[locale]/public/timeline/layout.tsx:
import { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { TimelineNavigationLayout } from "~/components/features/Timeline/timeline-navigation-layout";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import { generatePageMetadata } from "~/lib/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("timeline");
}

export default async function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultPublicTimelineLimit =
    PaginationItemsPerPage.PUBLIC_TIMELINE_PER_PAGE;

  // Prefetch public timeline data (infinite query)
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
      <TimelineNavigationLayout>{children}</TimelineNavigationLayout>
    </HydrationBoundary>
  );
}

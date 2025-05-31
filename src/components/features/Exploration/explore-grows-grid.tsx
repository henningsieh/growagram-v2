"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { z } from "zod";
import { PaginationItemsPerPage } from "~/assets/constants";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import { useTRPC } from "~/lib/trpc/client";
import { growExplorationSchema } from "../../../types/zodSchema";
import { ExploreGrowCard } from "./explore-grow-card";
import { ExploreGrowsEmptyState } from "./explore-grows-empty-state";

interface ExploreGrowsGridProps {
  filters: z.infer<typeof growExplorationSchema>;
}

export function ExploreGrowsGrid({ filters }: ExploreGrowsGridProps) {
  const trpc = useTRPC();
  const t = useTranslations("Exploration.Grows");

  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.grows.explore.infiniteQueryOptions(
        {
          ...filters,
          limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    );

  // Extract grows from pages
  const grows = data.pages.flatMap((page) => page.grows);

  // Get meta info from the first page
  const meta = data.pages[0]?.meta;

  // Intersection Observer callback for infinite scroll
  const onIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  // Set up intersection observer
  const loadingRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "100px", // Start loading 100px before the element is visible
      threshold: 0.01,
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect]);

  // Handle empty state
  if (!grows.length) {
    return <ExploreGrowsEmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            {meta?.pagination?.totalCount !== undefined && (
              <>
                {t("showing-results", {
                  defaultValue: "Showing {count} of {total} grows",
                  count: grows.length,
                  total: meta.pagination.totalCount,
                })}
              </>
            )}
          </p>
        </div>

        {/* Loading indicator when fetching more */}
        {isFetching && !isFetchingNextPage && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t("updating-results")}
          </div>
        )}
      </div>

      {/* Grows grid */}
      <ResponsiveGrid>
        {grows.map((grow, index) => (
          <motion.div
            key={grow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05, // Stagger animation
            }}
          >
            <ExploreGrowCard grow={grow} />
          </motion.div>
        ))}
      </ResponsiveGrid>

      {/* Infinite scroll loader */}
      <InfiniteScrollLoader
        ref={loadingRef}
        isLoading={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        itemsLength={grows.length}
        noMoreMessage={t("no-more-grows", {
          defaultValue: "No more grows to load.",
        })}
      />
    </div>
  );
}

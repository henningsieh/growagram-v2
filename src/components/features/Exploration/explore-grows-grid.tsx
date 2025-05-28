"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { z } from "zod";
import { PaginationItemsPerPage } from "~/assets/constants";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import SpinningLoader from "~/components/atom/spinning-loader";
import { useTRPC } from "~/lib/trpc/client";
import { growExplorationSchema } from "../../../types/zodSchema";
import { ExploreGrowCard } from "./explore-grow-card";

interface ExploreGrowsGridProps {
  filters: z.infer<typeof growExplorationSchema>;
}

export function ExploreGrowsGrid({ filters }: ExploreGrowsGridProps) {
  const trpc = useTRPC();
  const t = useTranslations("Grows");

  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery(
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
  const grows = data?.pages?.flatMap((page) => page.grows) ?? [];

  // Get meta info from the first page
  const meta = data?.pages?.[0]?.meta;

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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <SpinningLoader className="text-secondary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 text-red-500">
          {t("error-title", { defaultValue: "Error loading grows" })}
        </p>
        <p className="text-muted-foreground text-sm">
          {error.message ||
            t("error-default", {
              defaultValue: "Something went wrong. Please try again.",
            })}
        </p>
      </div>
    );
  }

  // Handle empty state
  if (!grows.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-2 text-lg">
          {t("no-grows-found", { defaultValue: "No grows found" })}
        </p>
        <p className="text-muted-foreground text-sm">
          {t("try-different-filters", {
            defaultValue: "Try adjusting your filters to find more grows.",
          })}
        </p>
        {meta?.pagination?.totalCount !== undefined && (
          <p className="text-muted-foreground mt-2 text-xs">
            {t("total-grows-available", {
              defaultValue: "Total grows available: {count}",
              count: meta.pagination.totalCount,
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            {t("updating-results", { defaultValue: "Updating results..." })}
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
        isLoading={isLoading}
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

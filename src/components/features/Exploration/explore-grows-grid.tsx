"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { useInfiniteQuery } from "@tanstack/react-query";

import { motion } from "framer-motion";

import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import SpinningLoader from "~/components/atom/spinning-loader";
import { GrowCard } from "~/components/features/Grows/grow-card";

import type { ExploreGrowsInput } from "~/server/api/root";

import { useTRPC } from "~/lib/trpc/client";

interface ExploreGrowsGridProps {
  filters: ExploreGrowsInput;
}

export function ExploreGrowsGrid({ filters }: ExploreGrowsGridProps) {
  const trpc = useTRPC();
  const t = useTranslations("Grows");

  const {
    data,
    isLoading,
    isFetching: isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery(
    trpc.grows.explore.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }),
  );

  // Flatten all pages into a single array of grows
  const grows = React.useMemo(
    () => data?.pages?.flatMap((page) => page.grows) ?? [],
    [data?.pages],
  );

  // Intersection Observer callback for infinite scroll
  const onIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  const loadingRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null, // Use viewport as root
      rootMargin: "200px", // Load next page 200px before reaching the bottom
      threshold: 0.01, // Trigger when even 1% of the element is visible
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <SpinningLoader className="text-secondary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="text-destructive text-center">
          {t("error-title")}
          {": "}
          {error.message}
        </p>
      </div>
    );
  }

  // Handle empty state
  if (grows.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="text-muted-foreground text-center">
          {t("no-grows-have-been-found")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Results count */}
      {data?.pages?.[0]?.totalCount !== undefined && (
        <motion.p
          className="text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {t("showing-results", {
            count: grows.length,
            total: data.pages[0].totalCount,
          })}
        </motion.p>
      )}

      {/* Responsive Grid */}
      <ResponsiveGrid>
        {grows.map((grow, index) => (
          <motion.div
            key={grow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: Math.min(index * 0.05, 0.5), // Stagger animation, max 0.5s delay
            }}
          >
            <GrowCard grow={grow} isSocial={false} />
          </motion.div>
        ))}
      </ResponsiveGrid>

      {/* Infinite Scroll Loader */}
      <InfiniteScrollLoader
        ref={loadingRef}
        isLoading={false}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        itemsLength={grows.length}
        noMoreMessage={t("no-more-grows")}
      />
    </motion.div>
  );
}

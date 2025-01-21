"use client";

import { InfiniteData } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { api } from "~/lib/trpc/react";
import {
  GetAllGrowsInput,
  GetAllGrowsOutput,
  GetAllGrowsType,
} from "~/server/api/root";

export default function PublicGrowsPage() {
  const utils = api.useUtils();
  const t = useTranslations("Grows");

  // Get data from cache that was prefetched in layout.tsx
  const cachedData = utils.grows.getAllGrows.getInfiniteData({
    limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
  });

  console.debug("cachedData", cachedData);

  // Create initialData from cache if available
  const initialData: InfiniteData<GetAllGrowsOutput, number> | undefined =
    cachedData
      ? {
          pages: cachedData.pages,
          pageParams: cachedData.pageParams.filter(
            (param): param is number => param !== null,
          ),
        }
      : undefined;

  const {
    data,
    isLoading,
    isFetching: isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.grows.getAllGrows.useInfiniteQuery(
    {
      limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
    } satisfies GetAllGrowsInput,
    {
      initialData,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const grows: GetAllGrowsType =
    data?.pages?.flatMap((page) => page.grows satisfies GetAllGrowsType) ?? [];

  // Intersection Observer callback
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  // Set up intersection observer
  const loadingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.01, // Trigger when even 1% of the element is visible
    });
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <>
      {isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : grows.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {t("NoGrowsFound")}
        </p>
      ) : (
        // this should be a flex-col timeline with animated grow cards
        <motion.div className="flex flex-col gap-4">
          {grows.map((grow) => (
            <GrowCard key={grow.id} grow={grow} isSocial={true} />
          ))}

          <InfiniteScrollLoader
            ref={loadingRef}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={grows.length}
            noMoreMessage="No more grows to load."
          />
        </motion.div>
      )}
    </>
  );
}

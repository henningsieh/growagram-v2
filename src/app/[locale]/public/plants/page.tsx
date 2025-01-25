"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { PaginationItemsPerPage } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import PlantCard from "~/components/features/Plants/plant-card";
import { api } from "~/lib/trpc/react";
import type {
  GetAllPlantsInput,
  GetAllPlantsOutput,
  GetAllPlantsType,
} from "~/server/api/root";

export default function PublicPlantsPage() {
  const utils = api.useUtils();
  const t = useTranslations("Plants");

  // Get data from cache that was prefetched in layout.tsx
  const cachedData = utils.plants.getAllPlants.getInfiniteData({
    limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
  });

  // Create initialData from cache if available
  const initialData: InfiniteData<GetAllPlantsOutput, number> | undefined =
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
  } = api.plants.getAllPlants.useInfiniteQuery(
    {
      limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
    } satisfies GetAllPlantsInput,
    {
      initialData,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const plants: GetAllPlantsType =
    data?.pages?.flatMap((page) => page.plants satisfies GetAllPlantsType) ??
    [];

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
      ) : plants.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          {t("NoPlantsFound")}
        </p>
      ) : (
        // this should be a flex-col timeline with animated plant cards
        <motion.div className="flex flex-col gap-4">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} isSocialProp={true} />
          ))}

          <InfiniteScrollLoader
            ref={loadingRef}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={plants.length}
            noMoreMessage="No more plants to load."
          />
        </motion.div>
      )}
    </>
  );
}

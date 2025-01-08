"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import PlantCard from "~/components/features/Plants/plant-card";
import { api } from "~/lib/trpc/react";
import { GetAllPlantsInput, GetAllPlantsType } from "~/server/api/root";

export default function PublicPlantsPage() {
  const {
    data,
    isLoading,
    isFetching: isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.plants.getAllPlants.useInfiniteQuery(
    {
      limit: 2,
    } satisfies GetAllPlantsInput,
    {
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
          No plants found.
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

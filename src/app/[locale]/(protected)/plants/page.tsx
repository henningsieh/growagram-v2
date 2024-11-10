"use client";

// src/app/[locale]/(protected)/plants/page.tsx:
import { useIntersection } from "@mantine/hooks";
import { useCallback, useEffect, useRef } from "react";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import PlantCard from "~/components/features/Plants/plant-card";
import { api } from "~/lib/trpc/react";

export default function PlantsPage() {
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.plant.getOwnPlants.useInfiniteQuery(
    { limit: 1 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const plants = data?.pages.flatMap((page) => page.plants) ?? [];

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
      threshold: 0.01, // Trigger when even 10% of the element is visible
    });
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  // Handling case if user hasn't uploaded any images
  if (!isFetching && plants.length === 0) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        You haven&apos;t added any plants yet.
      </p>
    );
  }
  return (
    <PageHeader
      title="My Plants"
      subtitle="View and manage your plants"
      buttonLink="/plants/add"
      buttonLabel="Add New Plant"
    >
      <ResponsiveGrid>
        {plants.map((plant, index) => (
          <PlantCard plant={plant} key={index} />
        ))}
      </ResponsiveGrid>

      <InfiniteScrollLoader
        ref={loadingRef}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        itemsLength={plants.length}
        noMoreMessage="No more plants to load."
      />
    </PageHeader>
  );
}

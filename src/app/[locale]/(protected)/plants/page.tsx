"use client";

import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
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
    { limit: 12 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const plants = data?.pages.flatMap((page) => page.plants) ?? [];

  // infinite refetching and scrolling
  const lastPlantRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPlantRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      void fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage]);

  // Handling case if user hasn't uploaded any images
  if (!isFetching && plants.length === 0) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        You haven&apos;t added any plants yet.
      </p>
    );
  }

  return (
    <PageHeader title="My Plants" subtitle="View and manage your plants">
      <ResponsiveGrid>
        {plants.map((plant, index) => (
          <PlantCard
            plant={plant}
            key={index}
            ref={index === plants.length - 1 ? ref : undefined}
          />
        ))}
      </ResponsiveGrid>

      {(isLoading || isFetchingNextPage) && <SpinningLoader />}
      {!hasNextPage && plants.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No more plants to load.
        </p>
      )}
    </PageHeader>
  );
}

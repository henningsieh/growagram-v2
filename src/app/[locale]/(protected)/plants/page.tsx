"use client";

import { useIntersection } from "@mantine/hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import PageHeader from "~/components/Layouts/page-header";
import PlantCard from "~/components/features/Plants/plant-card";
import { api } from "~/lib/trpc/react";

export default function PlantsPage() {
  // getOwnPlants from tRPC
  const {
    data,
    isFetching,
    isPending,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = api.plant.getOwnPlants.useInfiniteQuery(
    { limit: 1 },
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

  return (
    <PageHeader title="My Plants" subtitle="View and manage your plants">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {plants.map((plant, index) => (
          <PlantCard
            plant={plant}
            key={index}
            ref={index === plants.length - 1 ? ref : undefined}
          />
        ))}
      </div>
      {(isLoading || isFetchingNextPage) && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {!hasNextPage && plants.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No more plants to load.
        </p>
      )}
      {!isPending && plants.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          You haven&apos;t added any plants yet.
        </p>
      )}
    </PageHeader>
  );
}

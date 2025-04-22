"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import PlantCard from "~/components/features/Plants/plant-card";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { useIntersectionObserver } from "~/hooks/use-intersection";
import { getAllPlantsInput } from "~/lib/queries/plants";
import type { GetAllPlantsInput, GetAllPlantsType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";

export default function PublicPlantsPage() {
  const trpc = useTRPC();
  const t = useTranslations("Plants");

  // get suspense infinite query data from tanstack prefetchInfiniteQuery
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...trpc.plants.getAllPlants.infiniteQueryOptions(
        getAllPlantsInput satisfies GetAllPlantsInput,
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    });

  // Extract plants from pages - with suspend, data is guaranteed to be defined
  const plants = data.pages.flatMap(
    (page) => page.plants satisfies GetAllPlantsType,
  );

  // Configure the callback for intersection
  const fetchNextPageCallback = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Use the intersection observer hook
  const loadingRef = useIntersectionObserver(fetchNextPageCallback);

  return (
    <>
      {plants.length === 0 ? (
        <Alert variant="default" className="mx-auto mt-8 max-w-md">
          <AlertCircle className="size-11" />
          <AlertTitle className="text-xl">{t("no-plants-yet")}</AlertTitle>
        </Alert>
      ) : (
        <motion.div className="flex flex-col gap-4">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} isSocialProp={true} />
          ))}
          <InfiniteScrollLoader
            ref={loadingRef}
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

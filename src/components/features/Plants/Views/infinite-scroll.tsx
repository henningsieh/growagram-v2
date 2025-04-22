// src/components/features/Plants/Views/infinite-scroll.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import PlantCard from "~/components/features/Plants/plant-card";
import { useIntersectionObserver } from "~/hooks/use-intersection";
import { getOwnPlantsInput } from "~/lib/queries/plants";
import type { GetOwnPlantsInput, GetOwnPlantsType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { PlantsSortField } from "~/types/plant";

export default function InfiniteScrollPlantsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: PlantsSortField;
  sortOrder: SortOrder;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const trpc = useTRPC();
  const t = useTranslations("Plants");

  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...trpc.plants.getOwnPlants.infiniteQueryOptions(
        {
          ...getOwnPlantsInput,
          sortField,
          sortOrder,
        } satisfies GetOwnPlantsInput,
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          // initialPageParam: 1,
        },
      ),
    });

  // Extract plants from pages - with suspend, data is guaranteed to be defined
  const plants = data.pages.flatMap(
    (page) => page.plants satisfies GetOwnPlantsType,
  );

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  // Configure the callback for intersection
  const fetchNextPageCallback = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Use our custom intersection observer hook
  const loadingRef = useIntersectionObserver(fetchNextPageCallback);

  return (
    <>
      {plants.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {t("no-plants-yet")}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} isSocialProp={false} />
            ))}
          </ResponsiveGrid>

          <InfiniteScrollLoader
            ref={loadingRef}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={plants.length}
            noMoreMessage="No more plants to load."
          />
        </>
      )}
    </>
  );
}

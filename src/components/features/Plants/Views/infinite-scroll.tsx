"use client";

import { useTranslations } from "next-intl";
// src/components/features/Plants/Views/infinite-scroll.tsx:
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import PlantCard from "~/components/features/Plants/plant-card";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type { GetOwnPlantsInput, GetOwnPlantsType } from "~/server/api/root";
import { PlantsSortField } from "~/types/plant";

export default function InfiniteScrollPlantsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: PlantsSortField;
  sortOrder: SortOrder;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const t = useTranslations("Plants");

  useEffect(() => {
    router.replace(
      modulePaths.PLANTS.path, // Use only the base path
    );
  }, [router]);

  // Get initial data from cache
  const initialData = utils.plants.getOwnPlants.getInfiniteData({
    limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
    sortField,
    sortOrder,
  } satisfies GetOwnPlantsInput);

  // Infinite query
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.plants.getOwnPlants.useInfiniteQuery(
    {
      limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
      sortField,
      sortOrder,
    } satisfies GetOwnPlantsInput,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData,
    },
  );

  // Directly update the parent's isFetching state
  useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  // Extract plants from pages
  const plants =
    data?.pages?.flatMap((page) => page.plants satisfies GetOwnPlantsType) ??
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
      threshold: 0.01, // Trigger when even 10% of the element is visible
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
            isLoading={isLoading}
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

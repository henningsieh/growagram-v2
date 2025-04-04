"use client";

// src/components/features/Grows/Views/infinite-scroll.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import InfiniteScrollLoader from "~/components/Layouts/InfiniteScrollLoader";
import SpinningLoader from "~/components/Layouts/loader";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type { GetOwnGrowsInput, GetOwnGrowsType } from "~/server/api/root";
import { GrowsSortField } from "~/types/grow";

export default function InfiniteScrollGrowsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: GrowsSortField;
  sortOrder: SortOrder;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const t = useTranslations("Grows");

  React.useEffect(() => {
    router.replace(
      modulePaths.GROWS.path, // Use only the base path
    );
  }, [router]);

  // Get initial data from cache
  const initialData = utils.grows.getOwnGrows.getInfiniteData({
    limit: PaginationItemsPerPage.GROWS_PER_PAGE,
    sortField,
    sortOrder,
  } satisfies GetOwnGrowsInput);

  // Infinite query
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.grows.getOwnGrows.useInfiniteQuery(
    {
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      sortField,
      sortOrder,
    } satisfies GetOwnGrowsInput,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData,
    },
  );

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  // Extract grows from pages
  const grows: GetOwnGrowsType =
    data?.pages?.flatMap((page) => page.grows satisfies GetOwnGrowsType) ?? [];

  // Intersection Observer callback
  const onIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  // Set up intersection observer
  const loadingRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
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
      ) : grows.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {t("no-grows-yet")}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {grows.map((grow) => (
              <GrowCard key={grow.id} grow={grow} isSocial={false} />
            ))}
          </ResponsiveGrid>

          <InfiniteScrollLoader
            ref={loadingRef}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={grows.length}
            noMoreMessage="No more grows to load."
          />
        </>
      )}
    </>
  );
}

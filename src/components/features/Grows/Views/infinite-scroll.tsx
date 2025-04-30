import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { useIntersectionObserver } from "~/hooks/use-intersection";
import { getOwnGrowsInput } from "~/lib/queries/grows";
import type { GetOwnGrowsInput, GetOwnGrowsType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
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
  const trpc = useTRPC();
  const t = useTranslations("Grows");

  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...trpc.grows.getOwnGrows.infiniteQueryOptions(
        {
          ...getOwnGrowsInput,
          sortField,
          sortOrder,
        } satisfies GetOwnGrowsInput,
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          // initialPageParam: 1,
        },
      ),
    });

  // Extract grows from pages - with suspend, data is guaranteed to be defined
  const grows = data.pages.flatMap(
    (page) => page.grows satisfies GetOwnGrowsType,
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
      {grows.length === 0 ? (
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

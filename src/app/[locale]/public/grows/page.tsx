"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { useIntersectionObserver } from "~/hooks/use-intersection";
import { getAllGrowsInput } from "~/lib/queries/grows";
import type { GetAllGrowsInput, GetAllGrowsType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";

export default function PublicGrowsPage() {
  const trpc = useTRPC();
  const t = useTranslations("Grows");

  // get suspense infinite query data from tanstack prefetchInfiniteQuery
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...trpc.grows.getAllGrows.infiniteQueryOptions(
        getAllGrowsInput satisfies GetAllGrowsInput,
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    });

  // Extract grows from pages - with suspend, data is guaranteed to be defined
  const grows = data.pages.flatMap(
    (page) => page.grows satisfies GetAllGrowsType,
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
      {grows.length === 0 ? (
        <Alert variant="default" className="mx-auto mt-8 max-w-md">
          <AlertCircleIcon className="size-11" />
          <AlertTitle className="text-xl">{t("NoGrowsFound")}</AlertTitle>
        </Alert>
      ) : (
        // this should be a flex-col timeline with animated grow cards
        <div className="flex flex-col gap-4">
          {grows.map((grow) => (
            <GrowCard key={grow.id} grow={grow} isSocial={true} />
          ))}
          <InfiniteScrollLoader
            ref={loadingRef}
            // isLoading={false}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsLength={grows.length}
            noMoreMessage="No more grows to load."
          />
        </div>
      )}
    </>
  );
}

"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { useInfiniteQuery } from "@tanstack/react-query";

import { RefreshCwIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import SpinningLoader from "~/components/atom/spinning-loader";
import PostCard from "~/components/features/Timeline/Post/post-card";

import type { GetPostType } from "~/server/api/root";

import { useTRPC } from "~/lib/trpc/client";

import { PaginationItemsPerPage } from "~/assets/constants";

export default function PublicTimeline() {
  const t = useTranslations("Timeline");
  const trpc = useTRPC();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    trpc.posts.getPublicTimeline.infiniteQueryOptions(
      { limit: PaginationItemsPerPage.PUBLIC_TIMELINE_PER_PAGE },
      {
        getNextPageParam: (lastPage: { nextCursor: string | null }) =>
          lastPage.nextCursor,
        refetchOnWindowFocus: false,
      },
    ),
  );

  const posts = React.useMemo(
    () =>
      data?.pages.flatMap((page: { posts: GetPostType[] }) => page.posts) ?? [],
    [data],
  );

  // Intersection Observer callback
  const onIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const firstEntry = entries[0];
      if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
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
      threshold: 0.01, // Trigger when even 1% of the element is visible
    });
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <SpinningLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <p className="text-muted-foreground">{t("errors.loadFailed")}</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          {t("actions.retry")}
        </Button>
      </div>
    );
  }

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-12">
        <p className="text-lg font-medium">{t("public.empty.title")}</p>
        <p className="text-muted-foreground text-center">
          {t("public.empty.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: GetPostType) => (
        <PostCard key={post.id} post={post} />
      ))}

      <InfiniteScrollLoader
        ref={loadingRef}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        itemsLength={posts.length}
        noMoreMessage={t("errors.noMore")}
      />
    </div>
  );
}

// src/app/[locale]/(protected)/photos/layout.tsx:
import { getTranslations } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import type { GetOwnPhotosInput } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

export async function generateMetadata() {
  const t = await getTranslations("Navigation");
  return {
    title: `${t("grower-menu")} | ${t("my-photos")}`,
    description: t("my-photos-subline"),
  };
}

export default async function MyPhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Default input parameters for prefetching
  const defaultSortField = PhotosSortField.UPLOAD_DATE;
  const defaultSortOrder = SortOrder.DESC;
  const defaultLimit = PaginationItemsPerPage.PHOTOS_PER_PAGE;
  const defaultFilterNotConnected = false;

  // Prefetch data for InfiniteScrollPhotosView (initial load)
  await queryClient.prefetchInfiniteQuery(
    trpc.photos.getOwnPhotos.infiniteQueryOptions(
      {
        limit: defaultLimit,
        sortField: defaultSortField,
        sortOrder: defaultSortOrder,
        filterNotConnected: defaultFilterNotConnected,
      } satisfies GetOwnPhotosInput,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  // Prefetch data for PaginatedPhotosView (default first page)
  await queryClient.prefetchQuery(
    trpc.photos.getOwnPhotos.queryOptions({
      cursor: 1, // Default to page 1
      limit: defaultLimit,
      sortField: defaultSortField,
      sortOrder: defaultSortOrder,
      filterNotConnected: defaultFilterNotConnected,
    } satisfies GetOwnPhotosInput),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

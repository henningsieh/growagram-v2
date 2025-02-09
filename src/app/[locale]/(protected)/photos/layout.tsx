// src/app/[locale]/(protected)/photos/layout.tsx:
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { HydrateClient, api } from "~/lib/trpc/server";
import type { GetOwnPhotosInput } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

export const metadata = {
  title: "Grower's Plattform | My Photos",
  description: "Grower's Plattform | My Photos",
};

export default async function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page

  await api.photos.getOwnPhotos.prefetchInfinite({
    cursor: 1,
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField: PhotosSortField.UPLOAD_DATE,
    sortOrder: SortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnPhotosInput);

  await api.photos.getOwnPhotos.prefetch({
    cursor: 1,
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField: PhotosSortField.UPLOAD_DATE,
    sortOrder: SortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnPhotosInput);

  return <HydrateClient>{children}</HydrateClient>;
}

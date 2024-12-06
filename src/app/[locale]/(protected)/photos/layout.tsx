import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { api } from "~/lib/trpc/server";
import { HydrateClient } from "~/lib/trpc/server";
import { GetOwnImagesInput } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

export const metadata = {
  title: "My Photos",
  description: "My Photos",
};

export default async function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page

  await api.image.getOwnImages.prefetchInfinite({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField: PhotosSortField.UPLOAD_DATE,
    sortOrder: SortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnImagesInput);

  await api.image.getOwnImages.prefetch({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField: PhotosSortField.UPLOAD_DATE,
    sortOrder: SortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnImagesInput);

  return <HydrateClient>{children}</HydrateClient>;
}

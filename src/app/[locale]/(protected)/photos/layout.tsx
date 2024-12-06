import { PaginationItemsPerPage } from "~/assets/constants";
import { api } from "~/lib/trpc/server";
import { HydrateClient } from "~/lib/trpc/server";
import { GetOwnImagesInput } from "~/server/api/root";
import { ImageSortField, ImageSortOrder } from "~/types/image";

export const metadata = {
  title: "All Photos",
  description: "All Photos",
};

export default async function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page
  await api.image.getOwnImages.prefetchInfinite({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField: ImageSortField.UPLOAD_DATE,
    sortOrder: ImageSortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnImagesInput);
  await api.image.getOwnImages.prefetch({
    limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
    sortField: ImageSortField.UPLOAD_DATE,
    sortOrder: ImageSortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnImagesInput);

  return <HydrateClient>{children}</HydrateClient>;
}

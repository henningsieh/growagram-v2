import { api } from "~/lib/trpc/server";
import { HydrateClient } from "~/lib/trpc/server";
import { GetOwnImagesInput } from "~/server/api/root";
import { ImageSortField, SortOrder } from "~/types/image";

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
  void api.image.getOwnImages.prefetch({
    limit: 4,
    page: 1,
    sortField: ImageSortField.UPLOAD_DATE,
    sortOrder: SortOrder.DESC,
    filterNotConnected: false,
  } satisfies GetOwnImagesInput);

  return <HydrateClient>{children}</HydrateClient>;
}

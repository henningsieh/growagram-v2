import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import type { GetPhotoByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";
import { PhotosSortField } from "~/types/image";

// Allow both static and dynamic rendering
export const dynamic = "force-dynamic";
// Revalidate cache every minute
export const revalidate = 60;
// Enable dynamic parameters
export const dynamicParams = true;

// Pre-generate pages for all photos using tRPC caller instead of direct DB queries
export async function generateStaticParams() {
  const caller = await getCaller();
  try {
    // Using the tRPC server caller to fetch all photos with minimal data
    const allPhotosResult = await caller.photos.getAllPhotos({
      cursor: 1,
      limit: PaginationItemsPerPage.MAX_DEFAULT_ITEMS,
      sortOrder: SortOrder.DESC,
      sortField: PhotosSortField.UPLOAD_DATE,
    });

    // Map grows to the expected format
    return allPhotosResult.images.map((image) => ({
      id: image.id,
    })) satisfies GetPhotoByIdInput[];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function PublicPhotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

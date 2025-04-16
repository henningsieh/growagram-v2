import { SortOrder } from "~/components/atom/sort-filter-controls";
import type { GetGrowByIdInput } from "~/server/api/root";
import { caller } from "~/trpc/server";
import { GrowsSortField } from "~/types/grow";

// Allow both static and dynamic rendering
export const dynamic = "force-static";
// Revalidate cache every minute
export const revalidate = 60;
// Enable dynamic parameters
export const dynamicParams = true;

// Pre-generate pages for all grows using tRPC caller instead of direct DB queries
export async function generateStaticParams() {
  try {
    // Using the tRPC server caller to fetch all grows with minimal data
    const allGrowsResult = await caller.grows.getAllGrows({
      cursor: 1,
      limit: 1000, // Adjust based on your expected total number of grows
      sortOrder: SortOrder.DESC,
      sortField: GrowsSortField.CREATED_AT,
    });

    // Map grows to the expected format
    return allGrowsResult.grows.map((grow) => ({
      id: grow.id,
    })) satisfies GetGrowByIdInput[];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function PublicGrowByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

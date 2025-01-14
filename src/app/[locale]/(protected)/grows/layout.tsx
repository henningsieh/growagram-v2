// src/app/[locale]/(protected)/grows/layout.tsx:
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { api } from "~/lib/trpc/server";
import { GetOwnGrowsInput } from "~/server/api/root";
import { GrowsSortField } from "~/types/grow";

export const metadata = {
  title: "My Grows",
  description: "My Grows",
};

export default async function MyGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page

  await api.grows.getOwnGrows.prefetchInfinite({
    cursor: 1,
    limit: PaginationItemsPerPage.GROWS_PER_PAGE,
    sortField: GrowsSortField.NAME,
    sortOrder: SortOrder.ASC,
  } satisfies GetOwnGrowsInput);

  await api.grows.getOwnGrows.prefetch({
    cursor: 1,
    limit: PaginationItemsPerPage.GROWS_PER_PAGE,
    sortField: GrowsSortField.NAME,
    sortOrder: SortOrder.ASC,
  } satisfies GetOwnGrowsInput);

  return children;
}

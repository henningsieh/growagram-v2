import { PaginationItemsPerPage } from "~/assets/constants";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetAllGrowsInput } from "~/server/api/root";

export const metadata = {
  title: "Public Grows",
  description: "Explore Public Grows",
};

export default async function PublicGrowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data for the first page
  await api.grows.getAllGrows.prefetchInfinite({
    limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
  } satisfies GetAllGrowsInput);

  return children;
}

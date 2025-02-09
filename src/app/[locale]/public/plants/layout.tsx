import { PaginationItemsPerPage } from "~/assets/constants";
import { HydrateClient, api } from "~/lib/trpc/server";
import type { GetAllPlantsInput } from "~/server/api/root";

export const metadata = {
  title: "Public Plants",
  description: "Explore Public Plants",
};

export default async function PublicPlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data for the first page
  await api.plants.getAllPlants.prefetchInfinite({
    limit: PaginationItemsPerPage.PUBLIC_PLANTS_PER_PAGE,
  } satisfies GetAllPlantsInput);

  return <HydrateClient>{children}</HydrateClient>;
}

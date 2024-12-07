import { PaginationItemsPerPage } from "~/assets/constants";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnPlantsInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Plants",
  description: "Grower's Plattform | Plants",
};

export default async function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial own plants data server-side
  await api.plant.getOwnPlants.prefetchInfinite({
    limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
  } satisfies GetOwnPlantsInput);

  return <HydrateClient>{children}</HydrateClient>;
}

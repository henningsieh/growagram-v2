import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnPlantsInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Dashboard | Plants",
  description: "Grower's Dashboard | Plants",
};
export default async function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial own plants data
  await api.plant.getOwnPlants.prefetchInfinite({
    limit: 12,
  } satisfies GetOwnPlantsInput);

  return <HydrateClient>{children}</HydrateClient>;
}

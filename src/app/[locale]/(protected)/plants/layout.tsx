import { api } from "~/lib/trpc/server";
import { HydrateClient } from "~/lib/trpc/server";
import { GetOwnImagesInput, GetOwnPlantsInput } from "~/server/api/root";
import { ImageSortField, SortOrder } from "~/types/image";

export const metadata = {
  title: "App Plants",
  description: "App Plants",
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

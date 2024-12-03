import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnPlantsInput } from "~/server/api/root";

export const metadata = {
  title: "SEO Title",
  description: "SEO Title",
};
export default async function AddGrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch the plants query - this will populate the cache
  await api.plant.getOwnPlants.prefetch({
    limit: 100,
    // cursor?: number | null | undefined
  } satisfies GetOwnPlantsInput);

  return <HydrateClient>{children}</HydrateClient>;
}

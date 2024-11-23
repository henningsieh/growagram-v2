// src/app/[locale]/(protected)/plants/page.tsx
import PlantsContent from "~/components/features/Plants/plants-content";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnPlantsInput } from "~/server/api/root";

export default async function PlantsPage() {
  // Prefetch initial data
  await api.plant.getOwnPlants.prefetchInfinite({
    limit: 2,
  } satisfies GetOwnPlantsInput);

  return (
    <HydrateClient>
      <PlantsContent />
    </HydrateClient>
  );
}

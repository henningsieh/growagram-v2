import { api } from "~/lib/trpc/server";
import type { GetPlantByIdInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Edit Plant",
  description: "Grower's Plattform | Edit Plant",
};

export default async function PlantsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetPlantByIdInput>;
}) {
  const plantId = (await params).id;

  if (plantId !== "new") {
    //prefetch Grow to cache
    await api.plants.getById.prefetch({
      id: plantId,
    } satisfies GetPlantByIdInput);
  }

  return children;
}

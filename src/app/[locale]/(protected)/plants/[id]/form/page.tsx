import { notFound } from "next/navigation";
import PlantForm from "~/components/features/Plants/plant-form";
import { api } from "~/lib/trpc/server";
import type { GetPlantByIdInput, GetPlantByIdType } from "~/server/api/root";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<GetPlantByIdInput>; 
}) {
  const plantId = (await params).id;

  const plant = (
    plantId !== "new" ? await api.plants.getById({ id: plantId }) : undefined
  ) satisfies GetPlantByIdType | undefined;

  if (plantId !== "new" && plant === undefined) notFound();

  return <PlantForm plant={plant} />;
}

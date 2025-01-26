// src/app/[locale]/(public)/public/timeline/page.tsx:
import { notFound } from "next/navigation";
import PlantCard from "~/components/features/Plants/plant-card";
import { api } from "~/lib/trpc/server";
import type { GetPlantByIdInput } from "~/server/api/root";

export default async function PublicPlantByIdPage({
  params,
}: {
  params: Promise<GetPlantByIdInput>;
}) {
  const plantId = (await params).id;

  if (plantId.trim() === "") notFound();

  const plantByIdQuery = {
    id: plantId,
  } satisfies GetPlantByIdInput;

  const plant = await api.plants.getById(plantByIdQuery);

  if (plant === undefined) notFound();

  return (
    <>
      <PlantCard plant={plant} isSocialProp={true} />
    </>
  );
}

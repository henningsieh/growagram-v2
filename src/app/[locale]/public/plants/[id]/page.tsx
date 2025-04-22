// src/app/[locale]/(public)/public/timeline/page.tsx:
import { notFound } from "next/navigation";
import PlantCard from "~/components/features/Plants/plant-card";
import type { GetPlantByIdInput } from "~/server/api/root";
import { caller } from "~/trpc/server";

export default async function PublicPlantByIdPage({
  params,
}: {
  params: Promise<GetPlantByIdInput>;
}) {
  const plantId = (await params).id;

  if (plantId.trim() === "") notFound();

  const plantByIdQueryOptions = {
    id: (await params).id,
  } satisfies GetPlantByIdInput;

  // Get plant data directly from the server
  const plant = await caller.plants.getById(plantByIdQueryOptions);

  if (plant === undefined) notFound();

  return (
    <>
      <PlantCard plant={plant} isSocialProp={true} />
    </>
  );
}

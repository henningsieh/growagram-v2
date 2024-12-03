// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { notFound } from "next/navigation";
import FormContent from "~/components/Layouts/form-content";
import GrowForm from "~/components/features/Grows/grow-form";
import { HydrateClient, api } from "~/lib/trpc/server";
import {
  GetGrowByIdInput,
  GetOwnGrowType,
  GetOwnPlantsInput,
} from "~/server/api/root";

export default async function CreatePlantPage({
  params,
}: {
  params: GetGrowByIdInput;
}) {
  // Prefetch the plants query - this will populate the cache
  void api.plant.getOwnPlants.prefetch({
    limit: 100,
  } satisfies GetOwnPlantsInput);

  // Fetch the grow details only if growId is not "new"
  const growId = params.id;
  const grow = (
    growId !== "new" ? await api.grow.getById({ id: growId }) : undefined
  ) satisfies GetOwnGrowType | undefined;

  if (growId !== "new" && grow === undefined) notFound();

  return (
    <HydrateClient>
      <FormContent>
        <GrowForm grow={grow} />
      </FormContent>
    </HydrateClient>
  );
}

import FormContent from "~/components/Layouts/form-content";
import PlantForm from "~/components/features/Plants/plant-form";
import { api } from "~/lib/trpc/server";
import { GetPlantByIdInput, GetPlantByIdType } from "~/server/api/root";

export default async function EditPlantPage({
  params,
}: {
  params: GetPlantByIdInput;
}) {
  const plantId = params.id;

  const plant = (await api.plant.getById({
    id: plantId,
  })) satisfies GetPlantByIdType;

  return (
    <FormContent>
      <PlantForm plant={plant} />
    </FormContent>
  );
}

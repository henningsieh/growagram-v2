import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import PlantForm from "~/components/features/Plants/plant-form";
import { api } from "~/lib/trpc/server";
import { GetPlantByIdInput, GetPlantByIdType } from "~/server/api/root";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<GetPlantByIdInput>;
}) {
  const plantId = (await params).id;

  const plant = (await api.plant.getById({
    id: plantId,
  })) satisfies GetPlantByIdType;

  return (
    <PageHeader
      title={"Edit Plant"}
      subtitle={"Manage your plant's journey from seed to harvest and curing"}
      buttonLabel={"Back to Plants"}
      buttonLink={"/plants"}
    >
      <FormContent>
        <PlantForm plant={plant} />
      </FormContent>
    </PageHeader>
  );
}

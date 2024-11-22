import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import PlantForm from "~/components/features/Plants/plant-form";
import { api } from "~/lib/trpc/server";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const plantId = (await params).id;

  const plant = await api.plant.getById({ id: plantId });

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

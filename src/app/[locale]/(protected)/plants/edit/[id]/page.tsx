import PageHeader from "~/components/Layouts/page-header";
import PlantForm from "~/components/features/Plants/plant-form";
import { api } from "~/lib/trpc/server";
import { OwnPlant } from "~/server/api/root";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const plantId = (await params).id;

  const plant = await api.plant.getById({ id: plantId });

  return (
    <PageHeader
      title={"Create New Plant"}
      subtitle={"Add a new plant to your collection"}
    >
      <PlantForm plant={plant} />
    </PageHeader>
  );
}

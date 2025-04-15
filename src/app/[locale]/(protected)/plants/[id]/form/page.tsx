import { notFound } from "next/navigation";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PlantForm from "~/components/features/Plants/plant-form";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { api } from "~/lib/trpc/server";
import type { GetPlantByIdInput, GetPlantByIdType } from "~/server/api/root";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<GetPlantByIdInput>;
}) {
  const plantId = (await params).id;

  const plant = (
    plantId !== "new"
      ? await api.plants.getById({ id: plantId } satisfies GetPlantByIdInput)
      : undefined
  ) satisfies GetPlantByIdType | undefined;

  if (plantId !== "new" && plant === undefined) notFound();

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Plants.myplants-page-title",
      path: modulePaths.PLANTS.path,
    },
    {
      translationKey:
        plantId === "new"
          ? "Plants.form-pagerheader-new-title"
          : "Plants.form-pagerheader-edit-title",
      path: `${modulePaths.PLANTS.path}/${plantId}/form`,
    },
  ]);

  //prefetch own grows into cache
  await api.grows.getOwnGrows.prefetch({
    limit: 1000,
  });

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PlantForm plant={plant} />
    </>
  );
}

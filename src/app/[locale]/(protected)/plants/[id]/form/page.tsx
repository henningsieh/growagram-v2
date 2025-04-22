import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PlantForm from "~/components/features/Plants/plant-form";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import type { GetPlantByIdInput } from "~/server/api/root";
import { caller, getQueryClient, trpc } from "~/trpc/server";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<GetPlantByIdInput>;
}) {
  const queryClient = getQueryClient();
  const plantId = (await params).id;

  const plant =
    plantId !== "new"
      ? await caller.plants.getById({ id: plantId })
      : undefined;

  if (plantId !== "new" && plant === undefined) notFound();

  // Prefetch grows query
  await queryClient.prefetchQuery({
    ...trpc.grows.getOwnGrows.queryOptions({ limit: 1000 }),
  });

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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BreadcrumbSetter items={breadcrumbs} />
      <PlantForm plant={plant} />
    </HydrationBoundary>
  );
}

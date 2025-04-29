import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import type { UrlObject } from "url";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import PlantForm from "~/components/features/Plants/plant-form";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { DEFAULT_PLANT_SORT_FIELD } from "~/lib/queries/plants";
import type { GetPlantByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";
import { PlantsSortField, PlantsViewMode } from "~/types/plant";

export default async function EditPlantPage({
  params,
  searchParams,
}: {
  params: Promise<GetPlantByIdInput>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("Plants");
  const caller = await getCaller();
  const plantId = (await params).id;
  const queryParams = await searchParams;

  // Extract view parameters from searchParams, providing defaults
  const sortField =
    (queryParams?.sortField as PlantsSortField) || DEFAULT_PLANT_SORT_FIELD;
  const sortOrder = (queryParams?.sortOrder as SortOrder) || SortOrder.ASC;
  const viewMode =
    (queryParams?.viewMode as PlantsViewMode) || PlantsViewMode.PAGINATION;
  const page = queryParams?.page ? String(queryParams.page) : "1"; // Default to '1' if not present

  // Construct the back link with query parameters
  const backLink: UrlObject = {
    pathname: modulePaths.PLANTS.path,
    query: {
      sortField,
      sortOrder,
      viewMode,
      ...(viewMode === PlantsViewMode.PAGINATION && { page }), // Only add page if pagination
    },
  };

  const plant =
    plantId !== "new"
      ? await caller.plants.getById({ id: plantId })
      : undefined;

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

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={
          plant === undefined
            ? t("form-pagerheader-new-title")
            : t("form-pagerheader-edit-title")
        }
        subtitle={
          plant === undefined
            ? t("form-pagerheader-new-subtitle")
            : t("form-pagerheader-edit-subtitle")
        }
        buttonLabel={t("form-pageheader-backButtonLabel")}
        buttonVariant={"outline"}
        buttonLink={backLink} // Pass the constructed back link object
        buttonIcon={<ArrowLeftIcon />}
      >
        <PlantForm
          plant={plant}
          listView={{ sortField, sortOrder, viewMode, page }}
        />
      </PageHeader>
    </>
  );
}

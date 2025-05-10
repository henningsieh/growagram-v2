// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import type { UrlObject } from "url";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GrowForm } from "~/components/features/Grows/grow-form";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { DEFAULT_GROW_SORT_FIELD } from "~/lib/queries/grows";
import type { GetGrowByIdInput, GetGrowByIdType } from "~/server/api/root";
import { getCaller } from "~/trpc/server";
import { GrowsSortField, GrowsViewMode } from "~/types/grow";

export default async function EditGrowPage({
  params,
  searchParams,
}: {
  params: Promise<GetGrowByIdInput>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("Grows");
  const caller = await getCaller();
  const growId = (await params).id;
  const queryParams = await searchParams;

  // Extract view parameters from searchParams, providing defaults
  const sortField =
    (queryParams?.sortField as GrowsSortField) || DEFAULT_GROW_SORT_FIELD;
  const sortOrder = (queryParams?.sortOrder as SortOrder) || SortOrder.ASC;
  const viewMode =
    (queryParams?.viewMode as GrowsViewMode) || GrowsViewMode.PAGINATION;
  const page = queryParams?.page ? String(queryParams.page) : "1"; // Default to '1' if not present

  // Construct the back link with query parameters
  const backLink: UrlObject = {
    pathname: modulePaths.GROWS.path,
    query: {
      sortField,
      sortOrder,
      viewMode,
      ...(viewMode === GrowsViewMode.PAGINATION && { page }), // Only add page if pagination
    },
  };

  const grow = (
    growId !== "new"
      ? await caller.grows.getById({
          id: growId,
        } satisfies GetGrowByIdInput)
      : undefined
  ) satisfies GetGrowByIdType;

  if (growId !== "new" && grow === undefined) notFound();

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Grows.mygrows-page-title",
      path: modulePaths.GROWS.path,
    },
    {
      translationKey:
        growId === "new"
          ? "Grows.form-page-title-new"
          : "Grows.form-page-title-edit",
      path: `${modulePaths.GROWS.path}/${growId}/form`,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={
          grow === undefined
            ? t("form-page-title-new")
            : t("form-page-title-edit")
        }
        subtitle={
          grow === undefined
            ? t("form-page-subtitle-new")
            : t("form-page-subtitle-edit")
        }
        buttonLabel={t("button-label-back")}
        buttonVariant={"outline"}
        buttonLink={backLink} // Pass the constructed back link object
        // add lucide arrow left as buttonIcon
        buttonIcon={<ArrowLeftIcon />}
      >
        <GrowForm
          grow={grow}
          listView={{ sortField, sortOrder, viewMode, page }}
        />
      </PageHeader>
    </>
  );
}

// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { notFound } from "next/navigation";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import GrowForm from "~/components/features/Grows/grow-form";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import type { GetGrowByIdInput, GetGrowByIdType } from "~/server/api/root";
import { caller } from "~/trpc/server";

export default async function EditGrowPage({
  params,
}: {
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

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
      <GrowForm grow={grow} />
    </>
  );
}

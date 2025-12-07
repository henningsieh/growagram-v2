// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { notFound } from "next/navigation";

import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import { GrowForm } from "~/components/features/Grows/grow-form";

import type { GetGrowByIdInput, GetGrowByIdType } from "~/server/api/root";

import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { caller } from "~/lib/trpc/server";

import { modulePaths } from "~/assets/constants";

export default async function EditGrowPage({
  params,
}: {
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  const grow = (
    growId !== "new" ? await caller.grows.getById({ id: growId }) : undefined
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

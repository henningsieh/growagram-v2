// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import { GrowForm } from "~/components/features/Grows/grow-form";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import type { GetGrowByIdInput, GetGrowByIdType } from "~/server/api/root";
import { getCaller } from "~/trpc/server";

export default async function EditGrowPage({
  params,
}: {
  params: Promise<GetGrowByIdInput>;
}) {
  const t = await getTranslations("Grows");
  const growId = (await params).id;
  const caller = await getCaller();

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
        buttonLink={modulePaths.GROWS.path}
      >
        <GrowForm grow={grow} />
      </PageHeader>
    </>
  );
}

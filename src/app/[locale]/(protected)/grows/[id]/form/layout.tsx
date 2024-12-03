// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import { useTranslations } from "next-intl";
import React from "react";
import PageHeader from "~/components/Layouts/page-header";
import { GetGrowByIdInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Grows",
  description: "Grower's Plattform | Grows",
};

export default function AddGrowLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: GetGrowByIdInput;
}) {
  const t = useTranslations("Grows");
  const growId = params.id;

  return (
    <PageHeader
      title={growId === "new" ? t("page-title-new") : t("page-title-edit")}
      subtitle={
        growId === "new" ? t("page-subtitle-new") : t("page-subtitle-edit")
      }
    >
      {children}
    </PageHeader>
  );
}

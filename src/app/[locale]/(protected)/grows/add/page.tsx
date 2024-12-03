// src/app/[locale]/(protected)/grows/add/page.tsx:
import { useTranslations } from "next-intl";
import React from "react";
import PageHeader from "~/components/Layouts/page-header";
import GrowForm from "~/components/features/Grows/grow-form";

export default function CreatePlantPage() {
  const t = useTranslations("Grows");

  return (
    <PageHeader title={t("page-title")} subtitle={t("page-subtitle")}>
      <GrowForm />
    </PageHeader>
  );
}

import { useTranslations } from "next-intl";
import React from "react";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import PlantForm from "~/components/features/Plants/plant-form";

export default function CreatePlantPage() {
  const t = useTranslations("Plants");
  return (
    <PageHeader
      title={t("form-pagerheader-new-title")}
      subtitle={t("form-pagerheader-new-subtitle")}
    >
      <FormContent>
        <PlantForm />
      </FormContent>
    </PageHeader>
  );
}

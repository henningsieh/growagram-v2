import { useTranslations } from "next-intl";
import PageHeader from "~/components/Layouts/page-header";
import { GetPlantByIdInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Edit Plant",
  description: "Grower's Plattform | Edit Plant",
};

export default function PlantsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: GetPlantByIdInput;
}) {
  const plantId = params.id;

  const t = useTranslations("Plants");

  return (
    <PageHeader
      title={
        plantId !== "new"
          ? t("form-pagerheader-edit-title")
          : t("form-pagerheader-new-title")
      }
      subtitle={
        plantId !== "new"
          ? t("form-pagerheader-edit-subtitle")
          : t("form-pagerheader-new-subtitle")
      }
      buttonLabel={t("form-pageheader-backButtonLabel")}
      buttonLink={"/plants"}
    >
      {children}
    </PageHeader>
  );
}

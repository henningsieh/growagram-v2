import { useTranslations } from "next-intl";
import PageHeader from "~/components/Layouts/page-header";

export const metadata = {
  title: "Grower's Dashboard | Edit Plant",
  description: "Grower's Dashboard | Edit Plant",
};

export default function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Plants");

  return (
    <PageHeader
      title={t("form-pagerheader-edit-title")}
      subtitle={t("form-pagerheader-edit-subtitle")}
      buttonLabel={t("form-pageheader-backButtonLabel")}
      buttonLink={"/plants"}
    >
      {children}
    </PageHeader>
  );
}

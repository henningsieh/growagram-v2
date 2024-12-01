import { useTranslations } from "next-intl";
import PageHeader from "~/components/Layouts/page-header";
import { HydrateClient } from "~/lib/trpc/server";

export const metadata = {
  title: "Grower's Plattform | Add Plant",
  description: "Grower's Plattform | Add Plant",
};

export default function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Plants");

  return (
    <HydrateClient>
      <PageHeader
        title={t("form-pagerheader-new-title")}
        subtitle={t("form-pagerheader-new-subtitle")}
        buttonLabel={t("form-pageheader-backButtonLabel")}
        buttonLink={"/plants"}
      >
        {children}
      </PageHeader>
    </HydrateClient>
  );
}

import { useTranslations } from "next-intl";
import PageHeader from "~/components/Layouts/page-header";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnPlantsInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Dashboard | Plants",
  description: "Grower's Dashboard | Plants",
};
export default function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial own plants data
  void api.plant.getOwnPlants.prefetchInfinite({
    limit: 12,
  } satisfies GetOwnPlantsInput);

  const t = useTranslations("Plants");

  return (
    <HydrateClient>
      <PageHeader
        title={t("form-pagerheader-edit-title")}
        subtitle={t("form-pagerheader-edit-subtitle")}
        buttonLabel={t("form-pageheader-backButtonLabel")}
        buttonLink={"/plants"}
      >
        {children}
      </PageHeader>
    </HydrateClient>
  );
}

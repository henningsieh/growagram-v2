// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import { useTranslations } from "next-intl";
import React from "react";
import PageHeader from "~/components/Layouts/page-header";

export const metadata = {
  title: "Grower's Plattform | Grows",
  description: "Grower's Plattform | Grows",
};

export default function AddGrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Grows");

  return (
    <PageHeader title={t("page-title")} subtitle={t("page-subtitle")}>
      {children}
    </PageHeader>
  );
}

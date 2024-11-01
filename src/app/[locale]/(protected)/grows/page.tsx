import { useTranslations } from "next-intl";
import React from "react";
import PageHeader from "~/components/layouts/page-header";

function Grows() {
  const t = useTranslations("Dashboard.Grows");
  return (
    <PageHeader title={t("your-grows")} subtitle={``}>
      <></>
    </PageHeader>
  );
}

export default Grows;

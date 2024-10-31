import { useTranslations } from "next-intl";
import React from "react";

function Grows() {
  const t = useTranslations("Dashboard.Grows");
  return <h1 className="text-2xl">{t("your-grows")}</h1>;
}

export default Grows;

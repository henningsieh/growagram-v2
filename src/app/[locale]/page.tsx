import { useTranslations } from "next-intl";
import { Link } from "~/lib/i18n/routing";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <h1 className="m-4 text-4xl">{t("title")}</h1>

      <Link href="/timeline"> -- {t("about")}</Link>
    </div>
  );
}

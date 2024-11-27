import { useLocale } from "next-intl";
import { redirect } from "~/lib/i18n/routing";

export default function HomePage() {
  const locale = useLocale();

  redirect({ href: "/public/timeline", locale });
}

// src/app/not-found.tsx:
import { useLocale } from "next-intl";
import AppLayout from "~/app/[locale]/layout";
import { NotFoundWithPath } from "~/components/atom/notfound-withpath";

export default function LocalizedErrorLayout() {
  const locale = useLocale();

  return (
    <AppLayout params={Promise.resolve({ locale: locale })}>
      <NotFoundWithPath />
    </AppLayout>
  );
}

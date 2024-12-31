import { useLocale } from "next-intl";
import { NotFoundWithPath } from "~/components/atom/notfound-withpath";

import AppLayout from "./[locale]/layout";

export default function LocalizedErrorLayout() {
  const locale = useLocale();

  return (
    <AppLayout params={Promise.resolve({ locale: locale })}>
      <NotFoundWithPath />
    </AppLayout>
  );
}

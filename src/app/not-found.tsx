import AppLayout from "~/app/[locale]/layout";

import { Suspense } from "react";

import { useLocale } from "next-intl";

import { NotFoundWithPath } from "~/components/atom/notfound-withpath";

function LocalizedErrorContent() {
  const locale = useLocale();
  return (
    <AppLayout params={Promise.resolve({ locale: locale })}>
      <NotFoundWithPath />
    </AppLayout>
  );
}

export default function LocalizedErrorLayout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocalizedErrorContent />
    </Suspense>
  );
}

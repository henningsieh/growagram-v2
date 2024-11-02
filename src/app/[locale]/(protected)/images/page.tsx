// src/app/[locale]/(protected)/images/page.tsx
import { ImageGrid } from "~/components/images/image-grid";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { Link } from "~/lib/i18n/routing";
import { HydrateClient } from "~/lib/trpc/server";

import PageHeader from "../../../../components/layouts/page-header";

export default async function ImagesPage(props: {
  params: { locale: string };
}) {
  // Await params before accessing locale
  const { locale } = await (props.params as unknown as Promise<
    typeof props.params
  >);
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <HydrateClient>
      <PageHeader
        title="My Images"
        subtitle="View and manage your current images"
      >
        <Button asChild variant={"secondary"}>
          <Link href="/images/upload">Upload New Image</Link>
        </Button>
        <ImageGrid locale={locale} />
      </PageHeader>
    </HydrateClient>
  );
}

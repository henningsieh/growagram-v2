// src/app/[locale]/(protected)/images/page.tsx
import { ImageGrid } from "~/components/images/image-grid";
import PageHeader from "~/components/layouts/page-header";
import { api } from "~/lib/trpc/server";

export default async function ImagesPage() {
  void api.image.getUserImages.prefetch({});

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
    >
      {/* <ErrorBoundary fallback={<div>Something went wrong loading images</div>}>
        <Suspense fallback={<UserImagesLoadingGrid />}> */}
      <ImageGrid />
      {/* </Suspense>
      </ErrorBoundary> */}
    </PageHeader>
  );
}

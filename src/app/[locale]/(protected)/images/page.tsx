// src/app/[locale]/(protected)/images/page.tsx
import PageHeader from "~/components/Layouts/page-header";
import { ImageGrid } from "~/components/features/Images/image-grid";
import { api } from "~/lib/trpc/server";

export default async function ImagesPage() {
  void api.image.getUserImages.prefetch({});

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
      buttonLink="/images/upload"
      buttonLabel="Upload New Image"
    >
      {/* <ErrorBoundary fallback={<div>Something went wrong loading images</div>}>
        <Suspense fallback={<UserImagesLoadingGrid />}> */}
      <ImageGrid />
      {/* </Suspense>
      </ErrorBoundary> */}
    </PageHeader>
  );
}

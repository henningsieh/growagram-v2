// src/app/[locale]/(protected)/images/page.tsx
import type { inferRouterInputs } from "@trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ImageGrid } from "~/components/images/image-grid";
import UserImagesLoadingGrid from "~/components/images/loading-grid";
import PageHeader from "~/components/layouts/page-header";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/server";
import type { AppRouter } from "~/server/api/root";

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

// src/app/[locale]/(protected)/images/page.tsx
import type { inferRouterInputs } from "@trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ImageGrid } from "~/components/images/image-grid";
import PageHeader from "~/components/layouts/page-header";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/server";
import type { AppRouter } from "~/server/api/root";

function LoadingGrid() {
  // Adjust these values to match your ImageGrid layout
  const items = Array.from({ length: 12 }); // An array to create 12 skeleton items

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((_, index) => (
        <div key={index} className="aspect-w-1 aspect-h-1 w-full">
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}

export default async function ImagesPage() {
  void api.image.getUserImages.prefetch({});

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
    >
      <Button asChild variant="secondary">
        <Link href="/images/upload">Upload New Image</Link>
      </Button>

      <ErrorBoundary fallback={<div>Something went wrong loading images</div>}>
        <Suspense fallback={<LoadingGrid />}>
          <ImageGrid />
        </Suspense>
      </ErrorBoundary>
    </PageHeader>
  );
}

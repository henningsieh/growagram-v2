// src/app/[locale]/(protected)/images/page.tsx
import type { inferRouterInputs } from "@trpc/server";
import { ImageGrid } from "~/components/images/image-grid";
import PageHeader from "~/components/layouts/page-header";
import { api } from "~/lib/trpc/server";
import type { AppRouter } from "~/server/api/root";

export default async function ImagesPage() {
  // Only define the types you need in the component
  type GetUserImagesInput =
    inferRouterInputs<AppRouter>["image"]["getUserImages"];

  const getUserImagesInput: GetUserImagesInput = {
    limit: 2,
    cursor: null,
  };

  void api.image.getUserImages.prefetch(getUserImagesInput);

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
    >
      <ImageGrid />
    </PageHeader>
  );
}

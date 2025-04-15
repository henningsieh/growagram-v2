// src/app/[locale]/(protected)/photos/[id]/form/page.tsx:
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import ImageConnectPlants from "~/components/features/Photos/image-connect-plants";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { api } from "~/lib/trpc/server";
import type { GetPhotoByIdInput } from "~/server/api/root";

export default async function Page({
  params,
}: {
  params: Promise<GetPhotoByIdInput>;
}) {
  const imageId = (await params).id;

  // Get the image data
  const image = await api.photos.getById({ id: imageId });

  // Prefetch the plants query - this will populate the cache
  await api.plants.getOwnPlants.prefetch();

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Photos.upload-photos-title",
      path: modulePaths.PHOTOS.path,
    },
    {
      translationKey: "Photos.connect-plants-title",
      path: modulePaths.PHOTOUPLOAD.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <ImageConnectPlants image={image} />
    </>
  );
}

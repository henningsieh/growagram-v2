// src/app/[locale]/(protected)/photos/[id]/form/page.tsx:
import { notFound } from "next/navigation";

import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PhotoConnectPlants from "~/components/features/Photos/photo-connect-plants";

import type { GetPhotoByIdInput } from "~/server/api/root";
import type { GetPhotoByIdType } from "~/server/api/root";

import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { caller } from "~/lib/trpc/server";

import { modulePaths } from "~/assets/constants";

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<GetPhotoByIdInput>;
}) {
  const imageId = (await params).id;

  // Get the image data
  const image = (await caller.photos.getById({
    id: imageId,
  })) satisfies GetPhotoByIdType;

  // If image is not found, render notFound page
  if (!image) {
    notFound();
  }

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
      <PhotoConnectPlants image={image} />
    </>
  );
}

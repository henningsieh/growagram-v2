// src/app/[locale]/(protected)/photos/[id]/form/page.tsx:
import * as React from "react";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import ImageConnectPlants from "~/components/features/Photos/image-connect-plants";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import type { GetPhotoByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";

export default async function Page({
  params,
  searchParams, // Add searchParams to props
}: {
  params: Promise<GetPhotoByIdInput>;
  searchParams: Promise<{ returnTo?: string }>; // Make searchParams a promise
}) {
  const caller = await getCaller();
  const imageId = (await params).id;
  const queryParams = await searchParams;

  // Get the image data
  const image = await caller.photos.getById({ id: imageId });

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Photos.my-Photos",
      path: modulePaths.PHOTOS.path,
    },
    {
      translationKey: "Photos.connect-plants-title",
      path: modulePaths.PHOTOUPLOAD.path,
    },
  ]);

  // Extract the return URL parameters if present - now using the resolved searchParams
  const returnParams = queryParams.returnTo || "";

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />

      {/* Pass returnParams to the component */}
      <ImageConnectPlants image={image} returnParams={returnParams} />
    </>
  );
}

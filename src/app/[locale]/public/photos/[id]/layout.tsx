// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import React from "react";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetPhotoByIdInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Photos",
  description: "Grower's Plattform | Photos",
};

export default async function PublicPlantByIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetPhotoByIdInput>;
}) {
  const photoId = (await params).id;

  const photoByIdQuery = {
    id: photoId,
  } satisfies GetPhotoByIdInput;

  await api.photos.getById.prefetch(photoByIdQuery);

  return <HydrateClient>{children}</HydrateClient>;
}

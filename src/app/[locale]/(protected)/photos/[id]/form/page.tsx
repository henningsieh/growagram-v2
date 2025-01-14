// src/app/[locale]/(protected)/photos/[id]/form/page.tsx:
import ImageConnectPlants from "~/components/features/Photos/image-connect-plants";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetPhotoByIdInput } from "~/server/api/root";

export default async function Page({
  params,
}: {
  params: Promise<GetPhotoByIdInput>;
}) {
  const imageId = (await params).id;

  // Get the image data
  const image = await api.photos.getById({ id: imageId });

  // Prefetch the plants query - this will populate the cache
  void api.plants.getOwnPlants.prefetch();

  return <ImageConnectPlants image={image} />;
}

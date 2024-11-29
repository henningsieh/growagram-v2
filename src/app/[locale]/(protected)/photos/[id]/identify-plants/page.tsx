// src/app/[locale]/(protected)/photos/[id]/identify-plants/page.tsx:
import ImageConnectPlants from "~/components/features/Photos/image-connect-plants";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetImageByIdInput } from "~/server/api/root";

export default async function Page({
  params,
}: {
  params: Promise<GetImageByIdInput>;
}) {
  const imageId = (await params).id;

  // Get the image data
  const image = await api.image.getById({ id: imageId });

  // Prefetch the plants query - this will populate the cache
  void api.plant.getOwnPlants.prefetch();

  return (
    <HydrateClient>
      <ImageConnectPlants image={image} />
    </HydrateClient>
  );
}

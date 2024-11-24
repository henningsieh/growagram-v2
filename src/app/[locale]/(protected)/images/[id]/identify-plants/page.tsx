// src/app/[locale]/(protected)/images/[id]/identify-plants/page.tsx:
import ImageConnectPlants from "~/components/features/Images/image-connect-plants";
import { HydrateClient, api } from "~/lib/trpc/server";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
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

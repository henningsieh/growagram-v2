import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
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
      <PageHeader
        title="Identify Plants"
        subtitle="Tag the plants you see in this image"
        buttonLabel="Back"
        buttonLink="/images"
      >
        <FormContent>
          <ImageConnectPlants image={image} />
        </FormContent>
      </PageHeader>
    </HydrateClient>
  );
}

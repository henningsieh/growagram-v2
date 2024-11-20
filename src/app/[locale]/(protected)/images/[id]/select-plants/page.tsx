import PageHeader from "~/components/Layouts/page-header";
import ConnectPlants from "~/components/features/Images/connect-plants";
import { HydrateClient, api } from "~/lib/trpc/server";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const imageId = (await params).id;
  const image = await api.image.getById({ id: imageId });

  // Prefetch the plants data on the server
  void api.plant.getOwnPlants.prefetch({});

  return (
    <HydrateClient>
      <PageHeader
        title="Select Plants"
        subtitle="Select the plants on this image"
        buttonLabel="Back"
        buttonLink="/images"
      >
        <ConnectPlants image={image} />
      </PageHeader>
    </HydrateClient>
  );
}

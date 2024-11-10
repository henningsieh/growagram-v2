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
  void api.plant.getOwnPlants.prefetch({});

  return (
    <HydrateClient>
      <PageHeader
        title={"Edit Image"}
        subtitle={"Select the plants on this image"}
      >
        <ConnectPlants image={image} />
      </PageHeader>
    </HydrateClient>
  );
}

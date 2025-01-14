// src/app/[locale]/(public)/public/timeline/page.tsx:
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { api } from "~/lib/trpc/server";
import { GetGrowByIdInput } from "~/server/api/root";

export type PublicGrowByIdProps = {
  params: Promise<GetGrowByIdInput>;
};

export async function generateMetadata(
  { params }: PublicGrowByIdProps,
  // parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const grow = await api.grows.getById({
    id: (await params).id,
  } satisfies GetGrowByIdInput);

  // optionally access and extend (rather than replace) parent metadata
  //const previousImages = (await parent).openGraph?.images || [];

  const connectedPlantImages =
    grow?.plants.flatMap((plant) => plant.plantImages) || [];
  console.debug("imagesConnectedPlants", connectedPlantImages);

  return {
    title: grow?.name || "Grow not found",
    openGraph: {
      images: connectedPlantImages.map((plantImage) => ({
        url: plantImage.image.imageUrl,
        alt: `${plantImage.image.originalFilename} captured on ${plantImage.image.captureDate.toDateString()}`,
      })),
    },
  };
}

export default async function PublicGrowByIdPage({
  params,
}: PublicGrowByIdProps) {
  const grow = await api.grows.getById({
    id: (await params).id,
  } satisfies GetGrowByIdInput);

  // If grow is not found, return 404
  if (!grow) {
    notFound();
  }

  return (
    <>
      <GrowCard grow={grow} isSocial={true} />
    </>
  );
}

// src/app/[locale]/public/plants/[id]/page.tsx:
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlantCard from "~/components/features/Plants/plant-card";
import { caller } from "~/lib/trpc/server";
import type { GetPlantByIdInput } from "~/server/api/root";

// Using caller for data fetching

type PublicPlantByIdProps = {
  params: Promise<GetPlantByIdInput>;
};

export async function generateMetadata({
  params,
}: PublicPlantByIdProps): Promise<Metadata> {
  const plantId = (await params).id;
  if (plantId.trim() === "") notFound();

  const plant = await caller.plants.getById({
    id: plantId,
  } satisfies GetPlantByIdInput);

  if (!plant) {
    return {
      title: "Plant Not Found",
      description: "The plant you are looking for could not be found.",
    };
  }

  const pageTitle = plant.name || "Plant Details";
  // Using a generic description as 'description' field does not exist on plant entity
  const pageDescription = `Explore details and images for plant ${
    plant.name || "unnamed plant"
  }.`;

  const ogImages = (plant.plantImages
    ?.map((img) => {
      if (!img.image?.imageUrl) return null;
      return {
        url: img.image.imageUrl,
        alt: `${img.image.originalFilename ?? "Plant image"} captured on ${
          img.image.captureDate
            ? img.image.captureDate.toDateString()
            : "unknown date"
        }`,
        width: 1200, // Example width, adjust as needed
        height: 630, // Example height, adjust as needed
      };
    })
    ?.filter(Boolean) || []) as {
    // Filter out nulls
    url: string;
    alt: string;
    width: number;
    height: number;
  }[]; // Assert type

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: ogImages.length
        ? ogImages
        : [
            {
              url: "/images/growagram-og-landingpage-image.png", // Fallback image
              width: 1200,
              height: 630,
              alt: "GrowAGram Logo",
            },
          ],
      type: "article", // Example type
      // url: \`https://yourdomain.com/public/plants/${plant.id}\`, // Replace with actual domain and path
    },
    // You can also add Twitter specific metadata if needed
    // twitter: {
    //   card: "summary_large_image",
    //   title: pageTitle,
    //   description: pageDescription,
    //   images: ogImages.length ? ogImages.map(img => img.url) : ["/images/growagram-og-landingpage-image.png"],
    // },
  };
}

export default async function PublicPlantByIdPage({
  params,
}: PublicPlantByIdProps) {
  const plantId = (await params).id;

  if (plantId.trim() === "") notFound();

  const plant = await caller.plants.getById({
    id: plantId,
  } satisfies GetPlantByIdInput);

  if (!plant) {
    notFound();
  }

  return (
    <>
      <PlantCard plant={plant} isSocialProp={true} />
    </>
  );
}

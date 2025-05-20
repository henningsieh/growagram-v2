// src/app/[locale]/public/grows/[id]/page.tsx:
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { caller } from "~/lib/trpc/server";
import type { GetGrowByIdInput } from "~/server/api/root";

type PublicGrowByIdProps = {
  params: Promise<GetGrowByIdInput>;
};

export async function generateMetadata({
  params,
}: PublicGrowByIdProps): Promise<Metadata> {
  const growId = (await params).id;
  if (growId.trim() === "") notFound();

  const grow = await caller.grows.getById({
    id: growId,
  } satisfies GetGrowByIdInput);

  if (!grow) {
    return {
      title: "Grow Not Found",
      description: "The grow you are looking for could not be found.",
    };
  }

  const pageTitle = grow.name || "Grow Details";
  // Using a generic description as 'description' field does not exist on grow entity
  const pageDescription = `Explore details, images, and associated plants for grow ${grow.name || "unnamed grow"}.`;

  const ogImages = (grow.plants
    ?.flatMap((plant) => plant.plantImages || []) // Ensure flatMap gets an array
    .map((plantImage) => {
      if (!plantImage?.image?.imageUrl) return null;
      return {
        url: plantImage.image.imageUrl,
        alt: `${plantImage.image.originalFilename ?? "Plant image"} captured on ${
          plantImage.image.captureDate
            ? plantImage.image.captureDate.toDateString()
            : "unknown date"
        }`,
        width: 1200,
        height: 630,
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
      type: "article",
      // url: \`https://yourdomain.com/public/grows/${grow.id}\`, // Replace with actual domain and path
    },
    // twitter: {
    //   card: "summary_large_image",
    //   title: pageTitle,
    //   description: pageDescription,
    //   images: ogImages.length ? ogImages.map(img => img.url) : ["/images/growagram-og-landingpage-image.png"],
    // },
  };
}

export default async function PublicGrowByIdPage({
  params,
}: PublicGrowByIdProps) {
  // read route params
  const grow = await caller.grows.getById({
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

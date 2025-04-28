// src/app/[locale]/(public)/public/timeline/page.tsx:
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { formatDate } from "~/lib/utils";
import type { GetGrowByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";
import { OGImage } from "~/types/OGImage";
import { Locale } from "~/types/locale";

export type PublicGrowByIdProps = {
  params: Promise<GetGrowByIdInput>;
  parent: ResolvingMetadata;
};

export async function generateMetadata({
  params,
  // parent,
}: PublicGrowByIdProps): Promise<Metadata> {
  const caller = await getCaller();
  const locale = await getLocale();
  const t = await getTranslations();

  // Read route params
  const { id } = await params;
  const grow = await caller.grows.getById({
    id,
  } satisfies GetGrowByIdInput);

  // If grow not found, return basic metadata
  if (!grow) {
    return {
      title: "Grow not found",
    };
  }

  // Get connected plant images for OpenGraph
  const connectedPlantImages =
    grow?.plants.flatMap((plant) => plant.plantImages) || [];

  // Create array for OpenGraph images
  let ogImages: Array<OGImage> = [];

  // Add header image as the first image if available
  if (grow.headerImage) {
    ogImages.push({
      url: grow.headerImage.imageUrl,
      alt: grow.name || "Grow header image",
    });
  }

  // Add plant images
  ogImages = [
    ...ogImages,
    ...connectedPlantImages.map((plantImage) => ({
      url: plantImage.image.imageUrl,
      alt: plantImage.image.originalFilename || "",
    })),
  ];

  // Format creation date with proper localization
  const createdAtFormatted = formatDate(grow.createdAt, locale as Locale, {
    force: true,
  });

  // Get owner info for the description
  const ownerName = grow.owner.name || "";
  const ownerUsername = grow.owner.username ? `@${grow.owner.username}` : "";
  const ownerInfo = [ownerName, ownerUsername].filter(Boolean).join(" ");

  // Create a translated description with available grow information
  const description = [
    ownerInfo ? `${t("Platform.grown-by")}: ${ownerInfo}` : "",
    grow.plants.length > 0
      ? `${grow.plants.length} ${t("Platform.total-plants")}`
      : t("Grows.no-plants-connected"),
    createdAtFormatted
      ? `${t("Grows.sort-grows-createdAt")}: ${createdAtFormatted}`
      : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    title: grow.name || "Grow",
    description,
    openGraph: {
      images: ogImages.length > 0 ? ogImages : undefined,
    },
  };
}

export default async function PublicGrowByIdPage({
  params,
}: PublicGrowByIdProps) {
  const caller = await getCaller();
  const grow = await caller.grows.getById({
    id: (await params).id,
  } satisfies GetGrowByIdInput);

  // If grow is not found, return 404
  if (!grow) notFound();

  return (
    <>
      <GrowCard grow={grow} isSocial={true} />
    </>
  );
}

// src/app/[locale]/(public)/public/timeline/page.tsx:
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PlantCard } from "~/components/features/Plants/plant-card";
import { formatDate } from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateGrowthProgress";
import type { GetPlantByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";
import { Locale } from "~/types/locale";

export type PublicPlantByIdProps = {
  params: Promise<GetPlantByIdInput>;
  parent: ResolvingMetadata;
};

export async function generateMetadata({
  params,
  // parent,
}: PublicPlantByIdProps): Promise<Metadata> {
  const caller = await getCaller();
  const locale = await getLocale();
  const t = await getTranslations("Plants");

  const plant = await caller.plants.getById({
    id: (await params).id,
  });

  if (!plant) {
    return {
      title: "Plant not found",
    };
  }
  const plantImages = plant.plantImages || [];

  // Calculate the plant's growth information using the existing utility
  const growthInfo = calculateGrowthProgress(plant);

  // Get the phase name directly from the calculated growth info
  const phaseInfo = t(`phases.${growthInfo.currentPhase}`);

  // Format dates using the utility function with proper localization
  const startDateFormatted = plant.startDate
    ? formatDate(plant.startDate, locale as Locale, { force: true })
    : "";

  const harvestDateFormatted = plant.harvestDate
    ? formatDate(plant.harvestDate, locale as Locale, { force: true })
    : "";

  // Create a more detailed description with available plant information and translations
  const growInfo = plant.grow ? `${plant.grow.name}` : "";

  // Build the description with all available information
  const descriptionParts = [
    plant.strain?.name || "",
    growInfo,
    phaseInfo,
    startDateFormatted ? `${t("planting-date")}: ${startDateFormatted}` : "",
    harvestDateFormatted ? `${t("harvest-date")}: ${harvestDateFormatted}` : "",
  ].filter(Boolean);

  const description = descriptionParts.join(" • ").trim();

  return {
    title: plant.name || "Plant",
    description: description || "Plant details",
    openGraph: {
      images: plantImages.map((plantImage) => ({
        url: plantImage.image.imageUrl,
        alt: `${plantImage.image.originalFilename}`,
      })),
    },
  };
}

export default async function PublicPlantByIdPage({
  params,
}: PublicPlantByIdProps) {
  const caller = await getCaller();
  const plant = await caller.plants.getById({
    id: (await params).id,
  });

  if (!plant) notFound();

  return (
    <>
      <PlantCard plant={plant} isSocialProp={true} />
    </>
  );
}

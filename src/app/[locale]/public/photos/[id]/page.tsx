// src/app/[locale]/(public)/public/timeline/page.tsx:
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PhotoCard } from "~/components/features/Photos/photo-card";
import { formatDate } from "~/lib/utils";
import type { GetPhotoByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";
import { Locale } from "~/types/locale";

export type PublicPhotoByIdProps = {
  params: Promise<GetPhotoByIdInput>;
  parent: ResolvingMetadata;
};

export async function generateMetadata({
  params,
  // parent,
}: PublicPhotoByIdProps): Promise<Metadata> {
  const caller = await getCaller();
  const locale = await getLocale();
  const t = await getTranslations("Photos");

  // Read route params
  const { id } = await params;
  const photo = await caller.photos.getById({
    id,
  } satisfies GetPhotoByIdInput);

  // If photo not found, return basic metadata
  if (!photo) {
    return {
      title: "Photo not found",
    };
  }

  // Format the capture date using proper localization
  const captureDateFormatted = photo.captureDate
    ? formatDate(photo.captureDate, locale as Locale, { force: true })
    : "";

  // Use translated text for the description
  const description = captureDateFormatted
    ? `${t("capture-date")}: ${captureDateFormatted}`
    : "";

  return {
    title: photo.originalFilename || "Photo",
    description: description,
    openGraph: {
      images: [
        {
          url: photo.imageUrl,
          alt: photo.originalFilename || "Photo",
        },
      ],
    },
  };
}

export default async function PublicPhotoByIdPage({
  params,
}: PublicPhotoByIdProps) {
  const caller = await getCaller();
  const photo = await caller.photos.getById({
    id: (await params).id,
  });

  if (!photo) notFound();

  return (
    <>
      <PhotoCard photo={photo} isSocial={true} />
    </>
  );
}

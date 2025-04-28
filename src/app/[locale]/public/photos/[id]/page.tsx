// src/app/[locale]/(public)/public/timeline/page.tsx:
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoCard } from "~/components/features/Photos/photo-card";
import type { GetPhotoByIdInput } from "~/server/api/root";
import { getCaller } from "~/trpc/server";

export type PublicPhotoByIdProps = {
  params: Promise<GetPhotoByIdInput>;
};

export async function generateMetadata({
  params,
}: PublicPhotoByIdProps): Promise<Metadata> {
  const caller = await getCaller();
  const photo = await caller.photos.getById({
    id: (await params).id,
  });

  if (!photo) {
    return {
      title: "Photo not found",
    };
  }

  return {
    title: photo.originalFilename || "Photo",
    description: `Captured on ${photo.captureDate?.toDateString()}`,
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

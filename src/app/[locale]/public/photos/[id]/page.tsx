// src/app/[locale]/(public)/public/timeline/page.tsx:
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoCard from "~/components/features/Photos/photo-card";
import { caller } from "~/lib/trpc/server";
import type { GetPhotoByIdInput } from "~/server/api/root";

type PublicPhotoByIdProps = {
  params: Promise<GetPhotoByIdInput>;
};

export async function generateMetadata({
  params,
}: PublicPhotoByIdProps): Promise<Metadata> {
  const photoId = (await params).id;
  if (photoId.trim() === "") notFound();

  const photo = await caller.photos.getById({
    id: photoId,
  } satisfies GetPhotoByIdInput);

  if (!photo) {
    return {
      title: "Photo Not Found",
      description: "The photo you are looking for could not be found.",
    };
  }

  const pageTitle = photo.originalFilename || "Photo Details";
  const pageDescription = `View photo ${
    photo.originalFilename || "untitled photo"
  } uploaded on ${photo.createdAt.toDateString()}.`;

  const ogImages = [
    {
      url: photo.imageUrl,
      alt: `${photo.originalFilename ?? "Photo"} captured on ${
        photo.captureDate ? photo.captureDate.toDateString() : "unknown date"
      }`,
      width: 1200, // Example width
      height: 630, // Example height
    },
  ];

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: ogImages,
      type: "article",
      // url: `https://yourdomain.com/public/photos/${photo.id}\`, // Replace with actual domain and path
    },
    // twitter: {
    //   card: "summary_large_image",
    //   title: pageTitle,
    //   description: pageDescription,
    //   images: ogImages.map((img) => img.url),
    // },
  };
}

export default async function PublicPhotoByIdPage({
  params,
}: PublicPhotoByIdProps) {
  const photoId = (await params).id;

  if (photoId.trim() === "") notFound();

  const photoByIdQuery = {
    id: photoId,
  } satisfies GetPhotoByIdInput;

  const photo = await caller.photos.getById(photoByIdQuery);

  if (photo === undefined) notFound();

  return (
    <>
      <PhotoCard photo={photo} isSocial={true} />
    </>
  );
}

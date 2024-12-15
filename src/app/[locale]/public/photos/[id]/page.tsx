// src/app/[locale]/(public)/public/timeline/page.tsx:
import { notFound } from "next/navigation";
import PhotoCard from "~/components/features/Photos/photo-card";
import { api } from "~/lib/trpc/server";
import { GetPhotoByIdInput } from "~/server/api/root";

export default async function PublicPlantByIdPage({
  params,
}: {
  params: Promise<GetPhotoByIdInput>;
}) {
  const photoId = (await params).id;

  if (photoId.trim() === "") notFound();

  const photoByIdQuery = {
    id: photoId,
  } satisfies GetPhotoByIdInput;

  const photo = await api.photos.getById(photoByIdQuery);

  if (photo === undefined) notFound();

  return (
    <>
      <PhotoCard photo={photo} isSocial={true} />
    </>
  );
}

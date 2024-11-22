// src/app/[locale]/(protected)/images/page.tsx
import ImagesContent from "~/components/features/Images/images-content";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnImagesInput } from "~/server/api/root";

export default async function ImagesPage() {
  // Prefetch initial data with default sorting
  await api.image.getOwnImages.prefetchInfinite({
    limit: 2,
  } satisfies GetOwnImagesInput);

  return (
    <HydrateClient>
      <ImagesContent />
    </HydrateClient>
  );
}

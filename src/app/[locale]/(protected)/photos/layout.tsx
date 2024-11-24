// src/app/[locale]/(protected)/photos/layout.tsx:
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetOwnImagesInput } from "~/server/api/root";

export const metadata = {
  title: "All Photos",
  description: "All Photos",
};
export default async function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting
  await api.image.getOwnImages.prefetchInfinite({
    limit: 2,
  } satisfies GetOwnImagesInput);

  return <HydrateClient>{children}</HydrateClient>;
}

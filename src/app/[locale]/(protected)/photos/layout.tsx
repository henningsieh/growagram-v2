// src/app/[locale]/(protected)/photos/layout.tsx:
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getOwnPhotosInput } from "~/lib/queries/photos";
import type { GetOwnPhotosInput } from "~/server/api/root";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Grower's Platform | My Photos",
  description: "Grower's Platform | My Photos",
};
export const dynamic = "force-dynamic";

export default async function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch initial data with default sorting for the first page
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    ...trpc.photos.getOwnPhotos.infiniteQueryOptions(
      getOwnPhotosInput satisfies GetOwnPhotosInput,
    ),
  });

  await queryClient.prefetchQuery({
    ...trpc.photos.getOwnPhotos.queryOptions(
      getOwnPhotosInput satisfies GetOwnPhotosInput,
    ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

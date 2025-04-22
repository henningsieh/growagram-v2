// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import * as React from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { GetPlantByIdInput } from "~/server/api/root";
import { caller, getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Grower's Plattform | Plants",
  description: "Grower's Plattform | Plants",
};

export default async function PublicPlantByIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetPlantByIdInput>;
}) {
  const queryClient = getQueryClient();

  const plantByIdQueryOptions = {
    id: (await params).id,
  } satisfies GetPlantByIdInput;

  // Prefetch plant data
  await queryClient.prefetchQuery({
    ...trpc.plants.getById.queryOptions(plantByIdQueryOptions),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

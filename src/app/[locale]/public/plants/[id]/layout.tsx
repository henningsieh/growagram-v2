// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import React from "react";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetPlantByIdInput } from "~/server/api/root";

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
  const plantId = (await params).id;

  const plantByIdQuery = {
    id: plantId,
  } satisfies GetPlantByIdInput;

  await api.plants.getById.prefetch(plantByIdQuery);

  return children;
}

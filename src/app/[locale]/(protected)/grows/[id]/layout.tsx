// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import React from "react";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetGrowByIdInput, GetOwnPlantsInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Grows",
  description: "Grower's Plattform | Grows",
};

export default async function ProtectedGrowByIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  if (growId !== "new") {
    await api.grows.getById.prefetch({
      id: growId,
    } satisfies GetGrowByIdInput);

    //TODO: only prefetch "connectable" plants!
    await api.plants.getOwnPlants.prefetch({
      limit: 100,
      // cursor?: number | null | undefined
    } satisfies GetOwnPlantsInput);
  }

  return <HydrateClient>{children}</HydrateClient>;
}

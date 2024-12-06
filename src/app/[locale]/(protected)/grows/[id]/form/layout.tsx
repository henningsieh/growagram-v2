// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import { useTranslations } from "next-intl";
import React from "react";
import { HydrateClient, api } from "~/lib/trpc/server";
import {
  GetGrowByIdInput,
  GetOwnGrowType,
  GetOwnPlantsInput,
} from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Grows",
  description: "Grower's Plattform | Grows",
};

export default async function AddGrowLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  if (growId !== "new") {
    await api.grow.getById.prefetch({
      id: growId,
    } satisfies GetGrowByIdInput);

    //TODO: only prefetch "connectable" plants!
    void api.plant.getOwnPlants.prefetch(
      {
        limit: 100,
        // cursor?: number | null | undefined
      } satisfies GetOwnPlantsInput,
      { staleTime: 0 },
    );
  }

  return <HydrateClient>{children}</HydrateClient>;
}

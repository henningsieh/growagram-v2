// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import React from "react";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetGrowByIdInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Grows",
  description: "Grower's Plattform | Grows",
};

export default async function PublicGrowByIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  await api.grows.getById.prefetch({
    id: growId,
  } satisfies GetGrowByIdInput);

  return <HydrateClient>{children}</HydrateClient>;
}

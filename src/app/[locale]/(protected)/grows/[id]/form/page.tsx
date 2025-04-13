// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { notFound } from "next/navigation";
import GrowFormPage from "~/components/features/Grows/grow-form";
import { api } from "~/lib/trpc/server";
import type {
  GetConnectablePlantsInput,
  GetGrowByIdInput,
  GetGrowByIdType,
} from "~/server/api/root";

export default async function EditGrowPage({
  params,
}: {
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  const grow = (
    growId !== "new" ? await api.grows.getById({ id: growId }) : undefined
  ) satisfies GetGrowByIdType;

  if (growId !== "new" && grow === undefined) notFound();

  if (growId !== "new") {
    // preload connectable plants into utils cache
    api.plants.getConnectablePlants.prefetch({
      growId: growId,
    } satisfies GetConnectablePlantsInput);
  }

  return <GrowFormPage grow={grow} />;
}

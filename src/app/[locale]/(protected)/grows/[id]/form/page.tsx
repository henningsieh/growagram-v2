// src/app/[locale]/(protected)/grows/[id]/form/page.tsx:
import { notFound } from "next/navigation";
import GrowFormPage from "~/components/features/Grows/grow-form";
import { api } from "~/lib/trpc/server";
import { GetGrowByIdInput, GetOwnGrowType } from "~/server/api/root";

export default async function CreatePlantPage({
  params,
}: {
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  const grow = (
    growId !== "new" ? await api.grows.getById({ id: growId }) : undefined
  ) satisfies GetOwnGrowType | undefined;

  if (growId !== "new" && grow === undefined) notFound();

  return <GrowFormPage grow={grow} />;
}

// src/app/[locale]/(public)/public/timeline/page.tsx:
import { notFound } from "next/navigation";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { api } from "~/lib/trpc/server";
import { GetGrowByIdInput } from "~/server/api/root";

export default async function PublicGrowByIdPage({
  params,
}: {
  params: Promise<GetGrowByIdInput>;
}) {
  const growId = (await params).id;

  const grow = await api.grows.getById({
    id: growId,
  } satisfies GetGrowByIdInput);

  if (grow === undefined) notFound();

  return (
    <>
      <GrowCard grow={grow} isSocial={true} />
    </>
  );
}

// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/lib/db";
import { grows } from "~/lib/db/schema";
import { HydrateClient, api } from "~/lib/trpc/server";
import { GetGrowByIdInput } from "~/server/api/root";

export const metadata = {
  title: "Grower's Plattform | Grows",
  description: "Grower's Plattform | Grows",
};

export const revalidate = 3600;

export const dynamicParams = true;

// Pre-generate pages for all grows using direct DB query
export async function generateStaticParams() {
  const popularGrows = await db.query.grows.findMany({
    columns: {
      id: true,
    },
    orderBy: [asc(grows.createdAt)],
  });

  return popularGrows.map((grow) => ({
    id: grow.id,
  }));
}

export default async function PublicGrowByIdLayout({
  children,
  // params,
}: {
  children: React.ReactNode;
  // params: Promise<GetGrowByIdInput>;
}) {
  // const growId = (await params).id;

  // const grow = await api.grows.getById({
  //   id: growId,
  // } satisfies GetGrowByIdInput);

  // if (!grow) {
  //   notFound();
  // }

  return children;
}

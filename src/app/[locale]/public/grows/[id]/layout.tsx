// src/app/[locale]/public/grows/[id]/layout.tsx:
import { asc } from "drizzle-orm";
import { db } from "~/lib/db";
import { grows } from "~/lib/db/schema";
import { GetGrowByIdInput } from "~/server/api/root";

export const revalidate = 3600;

export const dynamicParams = true;

// Pre-generate pages for all grows using direct DB query
export async function generateStaticParams() {
  const allGrows = await db.query.grows.findMany({
    columns: {
      id: true,
    },
    orderBy: [asc(grows.createdAt)],
  });

  const staticParams = allGrows.map((grow) => ({
    id: grow.id,
  }));
  return staticParams satisfies GetGrowByIdInput[];
}

export default async function PublicGrowByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

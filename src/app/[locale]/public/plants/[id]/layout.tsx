// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import { asc } from "drizzle-orm";

import type { GetPlantByIdInput } from "~/server/api/root";

import { db } from "~/lib/db";
import { plants } from "~/lib/db/schema";

// Allow both static and dynamic rendering
// export const dynamic = "force-dynamic";
// Revalidate cache every hour
// export const revalidate = 3600;
// Enable dynamic parameters
// export const dynamicParams = true;

// Pre-generate pages for all plants using direct DB query
export async function generateStaticParams() {
  try {
    const allPlants = await db.query.plants.findMany({
      columns: {
        id: true,
      },
      orderBy: [asc(plants.createdAt)],
    });

    return allPlants.map((plant) => ({
      id: plant.id,
    })) satisfies GetPlantByIdInput[];
  } catch (error) {
    console.error("Error generating static params for plants:", error);
    return [];
  }
}

export default async function PublicPlantByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

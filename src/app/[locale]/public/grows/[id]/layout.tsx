import { asc } from "drizzle-orm";
import { db } from "~/lib/db";
import { grows } from "~/lib/db/schema";
import type { GetGrowByIdInput } from "~/server/api/root";

// Allow both static and dynamic rendering
export const dynamic = "force-dynamic";
// Revalidate cache every hour
export const revalidate = 3600;
// Enable dynamic parameters
export const dynamicParams = true;

// Pre-generate pages for all grows using direct DB query
export async function generateStaticParams() {
  try {
    const allGrows = await db.query.grows.findMany({
      columns: {
        id: true,
      },
      orderBy: [asc(grows.createdAt)],
    });

    return allGrows.map((grow) => ({
      id: grow.id,
    })) satisfies GetGrowByIdInput[];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function PublicGrowByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

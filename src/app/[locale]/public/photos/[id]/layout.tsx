// src/app/[locale]/(protected)/grows/[id]/form/layout.tsx:
import * as React from "react";
import { asc } from "drizzle-orm";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";
import type { GetPhotoByIdInput } from "~/server/api/root";

// Allow both static and dynamic rendering
export const dynamic = "force-dynamic";
// Revalidate cache every hour
export const revalidate = 3600;
// Enable dynamic parameters
export const dynamicParams = true;

// Pre-generate pages for all photos using direct DB query
export async function generateStaticParams() {
  try {
    const allPhotos = await db.query.images.findMany({
      columns: {
        id: true,
      },
      orderBy: [asc(images.createdAt)], // Assuming 'images' table has 'createdAt'
    });

    return allPhotos.map((photo) => ({
      id: photo.id,
    })) satisfies GetPhotoByIdInput[];
  } catch (error) {
    console.error("Error generating static params for photos:", error);
    return [];
  }
}

export default async function PublicPhotoByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

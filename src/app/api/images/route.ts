// src/app/api/images/route.ts
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    const newImage = await db
      .insert(images)
      .values({
        imageUrl,
        ownerId: session.user.id,
      })
      .returning();

    return NextResponse.json(newImage[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error saving image record" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Explicit validation of user and user.id
    if (
      !session?.user?.id ||
      typeof session.user.id !== "string" ||
      session.user.id.length === 0
    ) {
      return NextResponse.json(
        { error: "User not authenticated or invalid user ID" },
        { status: 401 },
      );
    }

    const userImages = await db.query.images.findMany({
      where: eq(images.ownerId, session.user.id),
      orderBy: (images, { desc }) => [desc(images.createdAt)],
    });

    return NextResponse.json(userImages);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error fetching images" },
      { status: 500 },
    );
  }
}

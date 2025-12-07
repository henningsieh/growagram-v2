import { NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "~/lib/db";
import { users } from "~/lib/db/schema";

interface RequestBody {
  userId: string;
}

export async function POST(req: NextRequest) {
  const { userId } = (await req.json()) as RequestBody;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error checking user ban status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// This is the type of the response from the POST request
export type CheckBanResponse = Awaited<ReturnType<typeof POST>>;

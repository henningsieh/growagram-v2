// src/app/api/token/user-details/route.ts:
import { env } from "~/env";
import { db } from "~/lib/db";

export async function GET(req: Request) {
  // Add internal API key validation
  if (req.headers.get("x-internal-auth") !== env.INTERNAL_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json(
      { error: "Missing userId parameter" },
      { status: 400 },
    );
  }

  try {
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId as string),
    });

    if (dbUser) {
      return Response.json({ username: dbUser.username, role: dbUser.role });
    } else {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

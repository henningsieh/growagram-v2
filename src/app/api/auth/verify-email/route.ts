import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { modulePaths } from "~/assets/constants";
import { env } from "~/env";
import { db } from "~/lib/db";
import { users, verificationTokens } from "~/lib/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const verificationToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (!verificationToken) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, verificationToken.identifier));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  // return NextResponse.json({ message: "Email verified successfully" });
  return NextResponse.redirect(
    `${env.NEXTAUTH_URL}${modulePaths.SIGNIN.path}?emailVerified=true`,
  );
}

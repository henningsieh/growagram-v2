// src/app/api/steadyhq/callback/route.ts:
import "next-auth";
import { NextResponse } from "next/server";
import axios from "axios";
import { modulePaths } from "~/assets/constants";
import { env } from "~/env";
import { uncachedAuth as auth } from "~/lib/auth";
import { getCaller } from "~/trpc/server";

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json(
      { error: "You are not authorized" },
      { status: 401 },
    );
  }

  const caller = await getCaller();

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is missing." },
      { status: 400 },
    );
  }

  try {
    const response = await axios.post(
      "https://steadyhq.com/api/v1/oauth/token",
      {
        client_id: env.STEADYHQ_CLIENT_ID,
        client_secret: env.STEADYHQ_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${env.NEXTAUTH_URL}/api/steadyhq/callback`,
      },
    );

    const {
      access_token,
      refresh_token,
      expires_in,
      refresh_token_expires_in,
    } = response.data as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      refresh_token_expires_in: number;
    };

    console.log("/api/steadyhq/callback OAuth response:", response.data);

    // Update tokens using the TRPC procedure
    await caller.users.updateUserTokens({
      userId: req.auth.user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      refreshTokenExpiresIn: refresh_token_expires_in,
    });

    return NextResponse.redirect(new URL(modulePaths.PREMIUM.path, req.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Failed to connect to SteadyHQ." },
      { status: 500 },
    );
  }
});

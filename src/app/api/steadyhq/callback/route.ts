import axios from "axios";
import "next-auth";
import { NextResponse } from "next/server";
import { modulePaths } from "~/assets/constants";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { api } from "~/lib/trpc/server";

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json(
      { error: "You are not authorized" },
      { status: 401 },
    );
  }

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
    } = response.data;

    console.log("OAuth callback response:", response.data);

    // Update tokens using the TRPC procedure
    await api.users.updateUserTokens({
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

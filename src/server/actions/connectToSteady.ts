"use server";

// src/server/actions/connectToSteady.ts:
// eslint-disable-next-line no-restricted-imports
import { env } from "~/env";

import { redirect } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/require-await
export async function connectToSteady() {
  const steadyClientId = env.STEADYHQ_CLIENT_ID;
  const steadyClientSecret = env.STEADYHQ_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/steadyhq/callback`;
  const state = crypto.randomUUID();

  const oauthUrl =
    `https://steadyhq.com/de/oauth/authorize` +
    `?client_id=${steadyClientId}` +
    `&client_secret=${steadyClientSecret}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=read_subscriptions` +
    `&response_type=code` +
    `&state=${state}`;

  redirect(oauthUrl);
}

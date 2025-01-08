"use server";

// src/app/actions/authActions.ts
import type { OAuthProviderType } from "next-auth/providers";
import { modulePaths } from "~/assets/constants";
import { signIn, signOut } from "~/lib/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/", redirect: true });
}

export async function signInWithProvider(
  provider: OAuthProviderType,
  callbackUrl: string = modulePaths.DASHBOARD.path,
) {
  await signIn(provider, { callbackUrl });
}

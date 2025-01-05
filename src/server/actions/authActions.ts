"use server";

// src/app/actions/authActions.ts
import { signIn, signOut } from "~/lib/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/", redirect: true });
}

export async function signInWithProvider(
  provider: string,
  callbackUrl: string = "/dashboard",
) {
  await signIn(provider, { callbackUrl });
}

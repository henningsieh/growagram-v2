"use server";

// src/app/actions/authActions.ts
import { signOut } from "~/lib/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/", redirect: true });
}

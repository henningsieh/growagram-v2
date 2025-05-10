import * as React from "react";
import NextAuth, { Session } from "next-auth";
import { headers } from "next/headers";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "~/lib/auth/auth.config";
import { db } from "~/lib/db";

// <-- Needed for safety

// Set up NextAuth
export const {
  handlers,
  auth: uncachedAuth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(db),
  ...authConfig,
});

/**
 * Safe auth() that checks if a request is available.
 */
async function safeAuth() {
  try {
    // Check if headers() is callable (i.e., inside request)
    await headers();
    return uncachedAuth();
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("`headers` was called outside a request scope")
    ) {
      console.warn("[auth]: No request available, returning null session.");
      return null;
    }
    throw err; // Forward unknown errors
  }
}

/**
 * Cache the safe version of auth()
 */
export const auth = React.cache(safeAuth);

export async function SignedIn(props: {
  children:
    | React.ReactNode
    | ((props: { user: Session["user"] }) => React.ReactNode);
}) {
  const sesh = await auth();
  return sesh?.user ? (
    <>
      {typeof props.children === "function"
        ? props.children({ user: sesh.user })
        : props.children}
    </>
  ) : null;
}

export async function SignedOut(props: { children: React.ReactNode }) {
  const sesh = await auth();
  return sesh?.user ? null : <>{props.children}</>;
}

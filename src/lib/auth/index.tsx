// src/lib/auth/index.ts:
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { Session } from "next-auth";
import { cache } from "react";
import authConfig from "~/lib/auth/auth.config.ts";
import { db } from "~/lib/db";

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

export const auth = cache(uncachedAuth);

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

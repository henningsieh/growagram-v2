// src/lib/auth/index.ts:
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { db } from "~/lib/db";

import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      console.debug("session: ", session);
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      console.debug("'AUTHORIZED' CALLED");
      const isLoggedIn = !!auth?.user;
      const paths = ["/me", "/profile"];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("api/auth/signin", nextUrl.origin);
        redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
        return Response.redirect(redirectUrl);
      }

      return true;
    },
  },
  ...authConfig,
});

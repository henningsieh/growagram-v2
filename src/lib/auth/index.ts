// src/lib/auth/index.ts:
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "~/lib/db";

export const authConfig = {
  providers: [Google],
  adapter: DrizzleAdapter(db),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      console.error("asödviubasdlvizb");
      const isLoggedIn = !!auth?.user;
      const paths = ["/me", "/profile"];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );
      console.log("aweiubawdlviubu", isProtected);

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("api/auth/signin", nextUrl.origin);
        redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
        return Response.redirect(redirectUrl);
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signOut, signIn } = NextAuth(authConfig);

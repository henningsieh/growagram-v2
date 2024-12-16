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
      // Careful type checking and assertion
      session.user = {
        ...session.user,
        id: token.sub as string,
        username: typeof token.username === "string" ? token.username : null,
        role:
          token.role === "user" || token.role === "admin" ? token.role : "user",
      };

      // console.debug("async session callback ", { session });

      return session;
    },

    async jwt({ token, user, trigger, session }) {
      // console.debug("async jwt callback: ", { token });

      // When user first logs in or during token refresh, fetch additional user details
      if (user || !token.username) {
        try {
          // Fetch the user from the database using the user ID
          const dbUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, token.sub as string),
          });

          if (dbUser) {
            token.username = dbUser.username;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }

      // the following case gets invoked by session.update() on user-form/page.tsx:
      if (trigger === "update" && session?.name) {
        console.debug("trigger session.update():", session);
        // Note, that `session` can be any arbitrary object, remember to validate it!
        token.name = session.name;
        token.username = session.username;
      }
      return token;
    },
  },
  ...authConfig,
});

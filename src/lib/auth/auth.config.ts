// src/lib/auth/auth.config.ts:
import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import { db } from "~/lib/db";

// Notice this is only an object, not a full Auth.js
// instance... in order to get "Auth on Edge" running.
export default {
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Discord({
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
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
} satisfies NextAuthConfig;

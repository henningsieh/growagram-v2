// src/lib/auth/auth.config.ts:
import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import { env } from "~/env";
import { UserRoles } from "~/types/user";

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
        role: Object.values(UserRoles).includes(token.role as UserRoles)
          ? (token.role as UserRoles)
          : UserRoles.USER,
      };
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      // console.debug("async jwt callback: ", { token });

      // When user first logs in or during token refresh, fetch additional user details
      if (user || !token.username) {
        try {
          const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";
          const response = await fetch(
            `${baseUrl}/api/token/user-details?userId=${token.sub}`,
            {
              headers: {
                "x-internal-auth": env.INTERNAL_API_KEY,
              },
            },
          );
          const data = await response.json();

          if (response.ok) {
            token.username = data.username;
            token.role = data.role;
          } else {
            console.error("Error fetching user details:", data.error);
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

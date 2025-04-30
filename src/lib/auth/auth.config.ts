// src/lib/auth/auth.config.ts:
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import { modulePaths } from "~/assets/constants";
import { env } from "~/env";
import { comparePasswords } from "~/lib/auth/password";
import { db } from "~/lib/db";
import { UserRoles } from "~/types/user";

// Notice this is only an object, not a full Auth.js
// instance... in order to get "Auth on Edge" running.
export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          return null;
        }

        console.debug("authorize credentials:", {
          email: credentials.email,
          password: credentials.password,
        });

        const user = await db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.email, credentials.email as string),
        });

        if (!user) {
          console.error("User not found");
          return null;
        }

        if (!user.passwordHash) {
          console.error("User has no password hash");
          return null;
        }

        const isValidPassword = await comparePasswords(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValidPassword) {
          console.error("Invalid password");
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role as UserRoles,
        };
      },
    }),
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Discord({
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session({ session, token }) {
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

    async jwt({ token, user, trigger, session: updatedSessionData, account }) {
      // console.debug("async jwt callback token:", token);
      if (account) {
        console.debug("async jwt callback account:", account);
      }

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
          const data = (await response.json()) as {
            username: string;
            role: UserRoles;
            error?: string;
          };

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

      // This gets invoked by session.update() in src/components/features/Account/edit-form.tsx:
      if (trigger === "update" && updatedSessionData) {
        console.debug("trigger session.update():", updatedSessionData);

        // Type assertion to a known structure and validate before updating
        const sessionData = updatedSessionData as Record<string, unknown>;

        // Validate the data before updating the token
        if (typeof sessionData.name === "string") {
          token.name = sessionData.name;
        }

        if (typeof sessionData.username === "string") {
          token.username = sessionData.username;
        }

        // Add any other fields you want to allow updating
        // Make sure to validate each field with proper type checking
      }
      return token;
    },
  },
  pages: {
    signIn: modulePaths.SIGNIN.path,
  },
} satisfies NextAuthConfig;

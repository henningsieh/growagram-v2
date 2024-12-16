// src/lib/auth/index.ts:
import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";

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
} satisfies NextAuthConfig;

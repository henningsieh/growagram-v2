// src/env.js:
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    INTERNAL_API_KEY: z.string().min(1),
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    STEADYHQ_CLIENT_ID: z.string().min(1),
    STEADYHQ_CLIENT_SECRET: z.string().min(1),
    AUTH_SECRET: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    MAIL_SERVER_HOST: z.string(),
    MAIL_SERVER_PORT: z.coerce
      .number()
      .refine((n) => n === 465 || n === 587, "Port must be either 465 or 587")
      .default(587),
    MAIL_SERVER_USER: z.string(),
    MAIL_SERVER_PASS: z.string(),
    MAIL_FROM_EMAIL: z.string().email(),
    MAIL_FROM_NAME: z.string().max(32),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLOUDINARY_NAME: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    STEADYHQ_CLIENT_ID: process.env.STEADYHQ_CLIENT_ID,
    STEADYHQ_CLIENT_SECRET: process.env.STEADYHQ_CLIENT_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NEXT_PUBLIC_CLOUDINARY_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    NODE_ENV: process.env.NODE_ENV,
    MAIL_SERVER_HOST: process.env.MAIL_SERVER_HOST,
    MAIL_SERVER_PORT: process.env.MAIL_SERVER_PORT,
    MAIL_SERVER_USER: process.env.MAIL_SERVER_USER,
    MAIL_SERVER_PASS: process.env.MAIL_SERVER_PASS,
    MAIL_FROM_EMAIL: process.env.MAIL_FROM_EMAIL,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

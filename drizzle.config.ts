import { env } from "~/env";

import { type Config, defineConfig } from "drizzle-kit";

const drizzleConfig = {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // tablesFilter: ["growagram.com_*"],
} satisfies Config;

export default defineConfig(drizzleConfig);

import { type Config, defineConfig } from "drizzle-kit";
import { env } from "~/env";

const drizzleConfig = {
  schema: "./src/lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["growagram.com_*"],
} satisfies Config;

export default defineConfig(drizzleConfig);

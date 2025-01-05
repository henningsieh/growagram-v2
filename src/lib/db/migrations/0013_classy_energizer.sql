ALTER TABLE "user" ADD COLUMN "passwordHash" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_hash_idx" ON "user" USING btree ("passwordHash");
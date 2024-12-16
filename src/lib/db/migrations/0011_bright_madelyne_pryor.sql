ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "user" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_verified_idx" ON "user" USING btree ("emailVerified");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");
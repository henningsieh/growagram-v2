ALTER TABLE "user" ADD COLUMN "banned_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;
CREATE TABLE IF NOT EXISTS "chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"sender_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "passwordHash" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steadyAccessToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steady_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steadyRefreshToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steady_refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_hash_idx" ON "user" USING btree ("passwordHash");
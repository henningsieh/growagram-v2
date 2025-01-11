ALTER TABLE "user" ADD COLUMN "steadyAccessToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steady_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steadyRefreshToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steady_refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
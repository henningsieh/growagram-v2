ALTER TABLE "notification" ADD COLUMN "entity_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "entity_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_entity_idx" ON "notification" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_unread_idx" ON "notification" USING btree ("user_id","read");
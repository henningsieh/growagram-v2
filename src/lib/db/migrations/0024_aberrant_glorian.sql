DROP INDEX IF EXISTS "follower_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "following_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "uniq_follow_idx";--> statement-breakpoint
ALTER TABLE "grow" ADD COLUMN "environment" text;--> statement-breakpoint
ALTER TABLE "grow" ADD COLUMN "culture_medium" text;--> statement-breakpoint
ALTER TABLE "grow" ADD COLUMN "fertilizer_type" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_owner_created_at_idx" ON "grow" USING btree ("owner_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_owner_updated_at_idx" ON "grow" USING btree ("owner_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_created_at_idx" ON "grow" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_updated_at_idx" ON "grow" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_owner_idx" ON "grow" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_name_idx" ON "grow" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_environment_idx" ON "grow" USING btree ("environment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_culture_medium_idx" ON "grow" USING btree ("culture_medium");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_fertilizer_type_idx" ON "grow" USING btree ("fertilizer_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_environment_created_at_idx" ON "grow" USING btree ("environment","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_culture_medium_created_at_idx" ON "grow" USING btree ("culture_medium","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_owner_created_at_idx" ON "image" USING btree ("owner_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_owner_capture_date_idx" ON "image" USING btree ("owner_id","captureDate" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_created_at_idx" ON "image" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_capture_date_idx" ON "image" USING btree ("captureDate" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_owner_idx" ON "image" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_owner_created_at_idx" ON "plant" USING btree ("owner_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_owner_updated_at_idx" ON "plant" USING btree ("owner_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_grow_created_at_idx" ON "plant" USING btree ("grow_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_strain_created_at_idx" ON "plant" USING btree ("strain_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_created_at_idx" ON "plant" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_updated_at_idx" ON "plant" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_start_date_idx" ON "plant" USING btree ("start_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_owner_idx" ON "plant" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_grow_idx" ON "plant" USING btree ("grow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_strain_idx" ON "plant" USING btree ("strain_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plants_name_idx" ON "plant" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_user_created_at_idx" ON "public_post" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "public_post" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_user_idx" ON "public_post" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_entity_type_created_at_idx" ON "public_post" USING btree ("entity_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_follows_follower_following_idx" ON "user_follow" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_follows_follower_created_at_idx" ON "user_follow" USING btree ("follower_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_follows_following_idx" ON "user_follow" USING btree ("following_id");
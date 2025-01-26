ALTER TABLE "image" ALTER COLUMN "asset_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "image" ALTER COLUMN "public_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "s3_key" text;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "s3_etag" text;
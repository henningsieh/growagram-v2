ALTER TABLE "plant" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "captureDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
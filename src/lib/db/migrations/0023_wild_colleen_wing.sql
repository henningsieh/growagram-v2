ALTER TABLE "grow" ADD COLUMN "header_image_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "grow" ADD CONSTRAINT "grow_header_image_id_image_id_fk" FOREIGN KEY ("header_image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "post_images" (
	"post_id" text NOT NULL,
	"image_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "post_images_post_id_image_id_pk" PRIMARY KEY("post_id","image_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_images" ADD CONSTRAINT "post_images_post_id_public_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."public_post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_images" ADD CONSTRAINT "post_images_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

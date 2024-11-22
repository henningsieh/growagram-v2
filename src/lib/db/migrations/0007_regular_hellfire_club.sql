ALTER TABLE "plant" DROP CONSTRAINT "plant_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "plant" DROP CONSTRAINT "plant_grow_id_grow_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plant" ADD CONSTRAINT "plant_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plant" ADD CONSTRAINT "plant_grow_id_grow_id_fk" FOREIGN KEY ("grow_id") REFERENCES "public"."grow"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

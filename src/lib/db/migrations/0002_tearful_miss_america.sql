CREATE TABLE IF NOT EXISTS "breeder" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "breeder_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cannabis_strain" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"thc_content" integer,
	"cbd_content" integer,
	"breeder_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "grow" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "grow_id" text;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "strain_id" text;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "start_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "growth_progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "seedling_phase_start" timestamp with time zone;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "vegetation_phase_start" timestamp with time zone;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "flowering_phase_start" timestamp with time zone;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "harvest_date" timestamp with time zone;--> statement-breakpoint
-- ALTER TABLE "plant" ADD COLUMN "curing_phase_start" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cannabis_strain" ADD CONSTRAINT "cannabis_strain_breeder_id_breeder_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."breeder"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "grow" ADD CONSTRAINT "grow_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plant" ADD CONSTRAINT "plant_grow_id_grow_id_fk" FOREIGN KEY ("grow_id") REFERENCES "public"."grow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plant" ADD CONSTRAINT "plant_strain_id_cannabis_strain_id_fk" FOREIGN KEY ("strain_id") REFERENCES "public"."cannabis_strain"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

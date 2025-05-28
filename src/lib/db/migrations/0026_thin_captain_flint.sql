ALTER TABLE "grow" ADD COLUMN "fertilizer_form" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "grows_fertilizer_form_idx" ON "grow" USING btree ("fertilizer_form");
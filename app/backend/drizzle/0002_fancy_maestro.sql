CREATE TABLE "private_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" varchar,
	"user_id" varchar NOT NULL,
	"is_locked" boolean
);
--> statement-breakpoint
ALTER TABLE "private_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "admin_bypass" ON "private_notes" AS PERMISSIVE FOR ALL TO public USING ((true) AND (auth.roles() ~ 'admin')) WITH CHECK ((true) AND (auth.roles() ~ 'admin'));--> statement-breakpoint
CREATE POLICY "owner_access" ON "private_notes" AS PERMISSIVE FOR ALL TO public USING ("private_notes"."user_id" = auth.uid()) WITH CHECK ("private_notes"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "no_update_locked" ON "private_notes" AS RESTRICTIVE FOR UPDATE TO public USING ("private_notes"."is_locked" = false) WITH CHECK ("private_notes"."is_locked" = false);
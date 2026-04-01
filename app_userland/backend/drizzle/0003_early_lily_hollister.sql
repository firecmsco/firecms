CREATE TYPE "public"."project_users_role" AS ENUM('admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TABLE "project_users" (
	"project_id" serial PRIMARY KEY NOT NULL,
	"id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" "project_users_role"
);

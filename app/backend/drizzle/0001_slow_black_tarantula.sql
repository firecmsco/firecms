CREATE TYPE "public"."posts_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" "posts_status";
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_entities_number_enum') THEN
        CREATE TYPE "public"."test_entities_number_enum" AS ENUM('10', '20');
    END IF;
END $$;-->statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_entities_string_enum') THEN
        CREATE TYPE "public"."test_entities_string_enum" AS ENUM('opt_a', 'opt_b');
    END IF;
END $$;-->statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags_test_entities" (
	"test_entitie_id" integer NOT NULL,
	"test_entity_tag_id" integer NOT NULL,
	CONSTRAINT "tags_test_entities_test_entitie_id_test_entity_tag_id_pk" PRIMARY KEY("test_entitie_id","test_entity_tag_id")
);
-->statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_entities" (
	"id" integer PRIMARY KEY NOT NULL,
	"string_plain" varchar,
	"string_multiline" varchar,
	"string_markdown" varchar,
	"string_url" varchar,
	"string_email" varchar,
	"string_enum" "test_entities_string_enum" NOT NULL,
	"number_plain" numeric,
	"number_enum" numeric,
	"boolean_plain" boolean,
	"date_plain" timestamp with time zone,
	"date_time" timestamp with time zone,
	"map_plain" jsonb,
	"array_string" jsonb,
	"array_enum" jsonb
);
-->statement-breakpoint
DROP TABLE IF EXISTS "private_notes";-->statement-breakpoint
CREATE TABLE "private_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar NOT NULL,
	"content" varchar,
	"user_id" varchar NOT NULL,
	"is_locked" boolean
);
-->statement-breakpoint
ALTER TABLE "authors" ALTER COLUMN "id" SET DATA TYPE integer;-->statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "id" SET DATA TYPE integer;-->statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" SET DATA TYPE integer;-->statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_users_pkey' AND contype = 'p'
    ) THEN
        ALTER TABLE "project_users" ADD PRIMARY KEY ("id");
    END IF;
END $$;-->statement-breakpoint
ALTER TABLE "project_users" ALTER COLUMN "project_id" SET DATA TYPE varchar;-->statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "id" SET DATA TYPE integer;-->statement-breakpoint
ALTER TABLE "tags_test_entities" ADD CONSTRAINT "tags_test_entities_test_entitie_id_test_entities_id_fk" FOREIGN KEY ("test_entitie_id") REFERENCES "public"."test_entities"("id") ON DELETE cascade ON UPDATE no action;-->statement-breakpoint
ALTER TABLE "tags_test_entities" ADD CONSTRAINT "tags_test_entities_test_entity_tag_id_tags_id_fk" FOREIGN KEY ("test_entity_tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
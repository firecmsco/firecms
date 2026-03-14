---
description: How to add new properties or make schema changes with database migrations
---

# Rebase Schema Migration Workflow

This guide explains how to modify your data model (add properties, change collections, etc.) and apply those changes to your PostgreSQL database.

## Overview

Rebase uses a **two-step schema generation process**:

1. **Rebase Collections → Drizzle Schema**: The `generate:schema` script reads your Rebase collection definitions and generates a Drizzle ORM schema file.
2. **Drizzle Schema → SQL Migrations**: The `db:generate` command compares the generated schema with your current database and creates SQL migration files.

```mermaid
graph LR
    A[collections.ts] -->|generate:schema| B[schema.generated.ts]
    B -->|db:generate| C[./drizzle/*.sql]
    C -->|db:migrate| D[(PostgreSQL)]
```

## Step-by-Step Instructions

### 1. Modify Your Collection Definitions

Edit your collection file (e.g., `app/shared/collections.ts` or your specific collection file):

```typescript
// Example: Adding a new property to an existing collection
const postsCollection: EntityCollection = {
    name: "Posts",
    dbPath: "posts",
    properties: {
        // ...existing properties
        
        // NEW: Add your new property
        published_at: {
            name: "Published At",
            type: "date",
            mode: "date"  // or "date_time"
        }
    }
};
```

### 2. Generate the Drizzle Schema

From the `app/backend` directory:

```bash
// turbo
pnpm run generate:schema
```

This reads your collections and outputs `src/schema.generated.ts`.

**Output:**
```
✅ Drizzle schema generated successfully at src/schema.generated.ts
You can now run pnpm db:generate to generate the SQL migration files.
```

### 3. Generate SQL Migration Files

```bash
// turbo
pnpm run db:generate
```

This compares your new schema with the current database state and generates SQL migration files in the `./drizzle` folder.

**Output:**
```
drizzle-kit: generating migration files...
✅ migrations generated in ./drizzle
```

You can inspect the generated `.sql` files to verify the changes before applying them.

### 4. Apply Migrations to Database

```bash
pnpm run db:migrate
```

This executes the pending migrations against your PostgreSQL database.

> [!WARNING]
> Always backup your database before running migrations in production!

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm run generate:schema` | Converts Rebase collections → Drizzle schema |
| `pnpm run db:generate` | Creates SQL migration files from schema changes |
| `pnpm run db:migrate` | Applies pending migrations to database |
| `pnpm run db:studio` | Opens Drizzle Studio to inspect your database |
| `pnpm run db:pull` | Introspects existing database into Drizzle schema |

## Common Scenarios

### Adding a New Property

1. Add the property to your collection definition
2. Run `generate:schema` → `db:generate` → `db:migrate`

### Changing a Property Type

> [!CAUTION]
> Changing existing column types may cause data loss. Review the generated migration carefully!

1. Modify the property type in your collection
2. Run `generate:schema` → `db:generate`
3. **Review the migration SQL** for any `ALTER COLUMN` or `DROP COLUMN` statements
4. Run `db:migrate` only if you're satisfied with the changes

### Adding a New Collection

1. Create the collection definition
2. Export it in your collections file
3. Run `generate:schema` → `db:generate` → `db:migrate`

### Adding Relations

1. Define the relation in your collection's `relations` array
2. For `owning` relations, the foreign key column is added automatically
3. For `many-to-many` relations, a junction table is created
4. Run `generate:schema` → `db:generate` → `db:migrate`

## Troubleshooting

### "DATABASE_URL is not set"

Make sure your `.env` file contains the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rebase
```

### Recovering from Failed Migrations (`DrizzleQueryError`)

If `db:migrate` fails (e.g., "column cannot be cast automatically" or "type already exists"), your database is in a stuck state. Here is how to recover:

#### Option 1: Fix the SQL Migration (Recommended)
Drizzle generated raw SQL that PostgreSQL rejected. You can manually fix the SQL file.
1. Open the pending `drizzle/000X_filename.sql` file.
2. Modify the SQL to be valid. For example, add a `USING id::text::uuid` clause to an `ALTER COLUMN`, or wrap a type creation in `DO $$ BEGIN IF NOT EXISTS... END IF; $$;`.
3. Run `pnpm run db:migrate` again.

#### Option 2: The "Force Sync" (Development Only)
If your migration journal is hopelessly out of sync and you are in development:
1. Delete the `drizzle/` folder entirely (wiping migration history).
2. Delete the `__drizzle_migrations` table in your PostgreSQL database.
3. Run `pnpm run db:generate` to generate a fresh init SQL file.
4. **DO NOT** run `db:migrate`. Instead, run `pnpm run db:push`. This forces Drizzle to realign the database schema with your current collections without relying on the broken migration history.

#### Option 3: The "Nuclear" Drop (Wipes Data)
If a specific table is corrupted and you don't care about the data (local dev):
1. Delete the failed `drizzle/000X_filename.sql` file.
2. Use a PostgreSQL client (e.g. `pnpm run db:studio` or TablePlus) and run `DROP TABLE "my_table" CASCADE;`.
3. Run `pnpm run db:generate` to generate a fresh creation script for that table.
4. Run `pnpm run db:migrate`.

### Development with --watch Mode

For active development, you can use watch mode to auto-regenerate the schema:

```bash
tsx ../../packages/backend/src/generate-drizzle-schema.ts --collections=../shared/collections.ts --output=src/schema.generated.ts --watch
```

---
description: How to add new properties or make schema changes with database migrations
---

# FireCMS Schema Migration Workflow

This guide explains how to modify your data model (add properties, change collections, etc.) and apply those changes to your PostgreSQL database.

## Overview

FireCMS uses a **two-step schema generation process**:

1. **FireCMS Collections → Drizzle Schema**: The `generate:schema` script reads your FireCMS collection definitions and generates a Drizzle ORM schema file.
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
| `pnpm run generate:schema` | Converts FireCMS collections → Drizzle schema |
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
DATABASE_URL=postgresql://user:password@localhost:5432/firecms
```

### Migration Already Applied

If you see errors about migrations already existing, you may need to:
- Check `./drizzle` folder for existing migration files
- Use `db:pull` to sync your schema with the current database state

### Development with --watch Mode

For active development, you can use watch mode to auto-regenerate the schema:

```bash
tsx ../../packages/backend/src/generate-drizzle-schema.ts --collections=../shared/collections.ts --output=src/schema.generated.ts --watch
```

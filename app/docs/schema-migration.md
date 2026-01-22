---
description: How to add new properties or make schema changes with database migrations
---

# FireCMS Schema Migration Workflow

This guide explains how to modify your data model (add properties, change collections, etc.) and apply those changes to your PostgreSQL database.

## Overview

FireCMS uses a **two-step schema generation process**:

1. **FireCMS Collections → Drizzle Schema**: The `generate:schema` script reads your FireCMS collection definitions and generates a Drizzle ORM schema file.
2. **Drizzle Schema → Database**: Either apply directly with `db:push` (development) or generate migration files with `db:generate` (production).

```mermaid
graph LR
    A[collections.ts] -->|generate:schema| B[schema.generated.ts]
    B -->|db:push| C[(Dev Database)]
    B -->|db:generate| D[./drizzle/*.sql]
    D -->|db:migrate| E[(Prod Database)]
```

## Quick Start (Development)

For rapid development, use `db:push` which applies changes directly without migration files:

```bash
# 1. Modify your collection (add property, relation, etc.)
# 2. Regenerate the Drizzle schema
// turbo
pnpm run generate:schema

# 3. Push changes directly to database
// turbo
pnpm run db:push
```

> [!TIP]
> Use `db:push` during development for fast iteration. It directly syncs your schema to the database without creating migration files.

## Production Workflow (With Migrations)

For production deployments, use migrations for version-controlled, reviewable changes:

### 1. Modify Your Collection Definitions

Edit your collection file (e.g., `app/shared/collections.ts`):

```typescript
const postsCollection: EntityCollection = {
    name: "Posts",
    dbPath: "posts",
    properties: {
        // ...existing properties
        
        // NEW: Add your new property
        published_at: {
            name: "Published At",
            type: "date",
            mode: "date"
        }
    }
};
```

### 2. Generate the Drizzle Schema

```bash
// turbo
pnpm run generate:schema
```

### 3. Generate SQL Migration Files

```bash
// turbo
pnpm run db:generate
```

This creates timestamped `.sql` files in `./drizzle`. **Review them before applying!**

### 4. Apply Migrations

```bash
pnpm run db:migrate
```

> [!WARNING]
> Always backup your database before running migrations in production!

## Quick Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `pnpm run generate:schema` | Collections → Drizzle schema | Always first step |
| `pnpm run db:push` | Apply schema directly to DB | Development |
| `pnpm run db:generate` | Create SQL migration files | Production prep |
| `pnpm run db:migrate` | Run pending migrations | Production deploy |
| `pnpm run db:studio` | Visual database browser | Debugging |
| `pnpm run db:pull` | DB → Drizzle schema (introspect) | Legacy DB import |

## Common Scenarios

### Adding a New Property

```bash
# Development
pnpm run generate:schema && pnpm run db:push

# Production
pnpm run generate:schema && pnpm run db:generate && pnpm run db:migrate
```

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
3. Run `generate:schema` → `db:push` (dev) or `db:generate` → `db:migrate` (prod)

### Adding Relations

1. Define the relation in your collection's `relations` array
2. For `owning` relations, the foreign key column is added automatically
3. For `many-to-many` relations, a junction table is created
4. Run `generate:schema` → `db:push` (dev) or the migration workflow (prod)

## Important Notes

### Tables Not in Schema Are Ignored

The `drizzle.config.ts` is configured to **only manage tables defined in your schema**. Other tables in the database (like `firecms_users`, `firecms_roles`, or any custom tables) are completely ignored and will not be affected by migrations.

### Never Use `db:pull` Then `db:migrate`

If you use `db:pull` to introspect an existing database, it creates a "baseline" migration file with commented-out SQL. **Do not run `db:migrate` after `db:pull`** - those tables already exist!

Instead, after `db:pull`:
1. Delete the generated migration file in `./drizzle/`
2. Clean up the `./drizzle/meta/_journal.json` to remove the entry
3. Or simply use `db:push` for future changes

## Troubleshooting

### "DATABASE_URL is not set"

Make sure your `.env` file exists in the `app/` folder and contains:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/firecms
```

### Migration Already Applied

If you see errors about migrations already existing:
- Check `./drizzle` folder for existing migration files
- Clean up old migrations if needed
- Use `db:push` for development to avoid migration file buildup

### Tables Being Dropped Unexpectedly

This shouldn't happen with the current config, but if it does:
- Check that `tablesFilter` in `drizzle.config.ts` includes your tables
- Ensure the schema file exports a `tables` object with all your tables

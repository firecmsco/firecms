---
name: rebase-backend-postgres
description: Guide for setting up and managing the Rebase PostgreSQL backend with Drizzle ORM. Use this skill when the user needs help with database setup, schema generation, migrations, or Drizzle configuration.
---

# Rebase PostgreSQL Backend

Rebase uses PostgreSQL as its primary database, with Drizzle ORM for type-safe schema management and migrations.

## Architecture

```
Collections (TypeScript) → Drizzle Schema (generated) → PostgreSQL (database)
```

The backend uses a **two-step process**:
1. **`generate:schema`** reads your Rebase collection definitions and generates a Drizzle ORM schema file (`schema.generated.ts`)
2. **`db:push`** or **`db:generate` + `db:migrate`** applies the schema to the database

## Prerequisites

- PostgreSQL 14+ (local or Docker)
- `DATABASE_URL` environment variable set in `app/.env`
- pnpm installed

## Quick Start (Development)

```bash
# From the app/ directory:

# 1. Generate Drizzle schema from collections
pnpm run generate:schema

# 2. Push changes directly to database (no migration files)
# Note: db:push runs from app/backend/, not app/
cd backend && pnpm run db:push
```

## Production Workflow (With Migrations)

```bash
# 1. Generate Drizzle schema
pnpm run generate:schema

# 2. Generate SQL migration files (creates timestamped .sql in ./drizzle/)
pnpm run db:generate

# 3. Review the generated SQL before applying!

# 4. Apply migrations
pnpm run db:migrate
```

## Command Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `pnpm run generate:schema` | Collections → Drizzle schema (from `app/`) | Always first step |
| `cd backend && pnpm run db:push` | Apply schema directly to DB (from `app/backend/`) | Development |
| `pnpm run db:generate` | Generate schema + create SQL migration files (from `app/`) | Production prep |
| `pnpm run db:migrate` | Run pending migrations (from `app/`) | Production deploy |
| `pnpm run db:studio` | Visual database browser — Drizzle Studio (from `app/`) | Debugging |
| `pnpm run db:pull` | DB → Drizzle schema — introspect (from `app/`) | Legacy DB import |

## Drizzle Configuration

The `drizzle.config.ts` is configured to:
- **Only manage tables defined in your schema** — other tables (like `rebase_users`, `rebase_roles`) are ignored
- Use the `DATABASE_URL` from your `.env` file
- Output migrations to `./drizzle/`

## Key Backend Packages

| Package | Purpose |
|---------|---------|
| `packages/backend` | Express server, API generation, auth, storage |
| `packages/postgresql` | PostgreSQL-specific data source implementation |
| `packages/types` | Shared TypeScript type definitions |

## Backend Initialization

The backend is initialized using two functions from `@rebasepro/backend`:

```typescript
import express from "express";
import { createServer } from "http";
import {
    createPostgresDatabaseConnection,
    initializeRebaseBackend,
    initializeRebaseAPI
} from "@rebasepro/backend";
import { tables, enums, relations } from "./schema.generated";

const app = express();
const server = createServer(app);
const db = createPostgresDatabaseConnection(process.env.DATABASE_URL!);

// 1. Initialize backend (auth, storage, realtime, WebSocket)
const backend = await initializeRebaseBackend({
    server,
    app,
    datasource: {
        connection: db,
        schema: { tables, enums, relations }
    },
    auth: { jwtSecret: process.env.JWT_SECRET! },
    storage: { type: "local", basePath: "./uploads" },
});

// 2. Initialize REST/GraphQL API (optional, for external integrations)
await initializeRebaseAPI(app, backend);

server.listen(3001);
```

## Important Notes

- **Never use `db:pull` then `db:migrate`** — introspected databases already have the tables
- **Always backup before production migrations** — `ALTER COLUMN` or `DROP COLUMN` can cause data loss
- **Tables not in schema are ignored** — custom tables and internal Rebase tables are safe
- **Review generated SQL** — always inspect the `.sql` files in `./drizzle/` before applying

## References

- **Migration Workflow:** See [references/migration-workflow.md](references/migration-workflow.md) for detailed steps.
- **Drizzle ORM Docs:** See [references/drizzle-guide.md](references/drizzle-guide.md) for Drizzle-specific guidance.
- **Troubleshooting:** See [references/troubleshooting.md](references/troubleshooting.md) for common database issues.

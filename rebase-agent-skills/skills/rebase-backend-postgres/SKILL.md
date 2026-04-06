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
1. **`rebase schema generate`** reads your Rebase collection definitions and generates a Drizzle ORM schema file (`schema.generated.ts`)
2. **`rebase db push`** or **`rebase db generate` + `rebase db migrate`** applies the schema to the database

## Prerequisites

- PostgreSQL 14+ (local or Docker)
- `DATABASE_URL` environment variable set in `app/.env`
- pnpm installed

## Quick Start (Development)

```bash
# From the app/ directory:

# 1. Generate Drizzle schema from collections
rebase schema generate

# 2. Push changes directly to database (no migration files)
rebase db push
```

## Production Workflow (With Migrations)

```bash
# 1. Generate Drizzle schema
rebase schema generate

# 2. Generate SQL migration files (creates timestamped .sql in ./drizzle/)
rebase db generate

# 3. Review the generated SQL before applying!

# 4. Apply migrations
rebase db migrate
```

## Command Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `rebase schema generate` | Collections → Drizzle schema | Always first step |
| `rebase db push` | Apply schema directly to DB | Development |
| `rebase db generate` | Generate schema + create SQL migration files | Production prep |
| `rebase db migrate` | Run pending migrations | Production deploy |
| `rebase db studio` | Visual database browser — Drizzle Studio | Debugging |
| `rebase db pull` | DB → Drizzle schema — introspect | Legacy DB import |

## Drizzle Configuration

The `drizzle.config.ts` is configured to:
- **Only manage tables defined in your schema** — other tables (like internal `rebase.*` tables) are ignored
- Use the `DATABASE_URL` from your `.env` file
- Output migrations to `./drizzle/`

## Key Backend Packages

| Package | Purpose |
|---------|---------|
| `packages/backend` | Express server, API generation, auth, storage |
| `packages/postgresql` | PostgreSQL-specific data source implementation |
| `packages/types` | Shared TypeScript type definitions |

## Backend Initialization

The backend is initialized using `initializeRebaseBackend` from `@rebasepro/backend`:

```typescript
import { Hono } from "hono";
import { createServer } from "http";
import {
    createPostgresDatabaseConnection,
    initializeRebaseBackend,
    HonoEnv
} from "@rebasepro/backend";
import { tables, enums, relations } from "./schema.generated";

const app = new Hono<HonoEnv>();
const server = createServer(/* ... */);
const { db } = createPostgresDatabaseConnection(process.env.DATABASE_URL!);

// Initialize backend (auth, storage, realtime, WebSocket, REST)
const backend = await initializeRebaseBackend({
    server,
    app,
    driver: {
        connection: db,
        schema: { tables, enums, relations }
    },
    auth: { jwtSecret: process.env.JWT_SECRET! },
    storage: { type: "local", basePath: "./uploads" },
});

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

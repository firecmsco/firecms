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
| `packages/server-core` | Hono server coordinator, API generation, auth, storage |
| `packages/server-postgresql` | PostgreSQL bootstrapper, data driver, realtime (LISTEN/NOTIFY) |
| `packages/types` | Shared TypeScript type definitions |

## Backend Initialization (Bootstrapper Protocol)

The backend uses the **bootstrapper protocol** — database-specific logic is encapsulated in bootstrapper objects that the server coordinator iterates over during initialization.

```typescript
import { Hono } from "hono";
import { getRequestListener } from "@hono/node-server";
import { createServer } from "http";
import {
    initializeRebaseBackend,
    HonoEnv
} from "@rebasepro/server-core";
import { createPostgresDatabaseConnection, createPostgresBootstrapper } from "@rebasepro/server-postgresql";
import { tables, enums, relations } from "./schema.generated";

const app = new Hono<HonoEnv>();
const server = createServer(getRequestListener(app.fetch));

const { db, connectionString } = createPostgresDatabaseConnection(process.env.DATABASE_URL!);

const backend = await initializeRebaseBackend({
    collectionsDir: path.resolve(__dirname, "../../shared/collections"),
    server,
    app,
    bootstrappers: [
        createPostgresBootstrapper({
            connection: db,
            schema: { tables, enums, relations },
            adminConnectionString: process.env.DATABASE_URL,
            connectionString  // enables cross-instance realtime via LISTEN/NOTIFY
        })
    ],
    auth: {
        jwtSecret: process.env.JWT_SECRET!,
        accessExpiresIn: "1h",
        refreshExpiresIn: "30d",
        seedDefaultRoles: true,
        allowRegistration: false,
    },
    storage: { type: "local", basePath: "./uploads" },
    history: true,
});

server.listen(3001);
```

### Key Concepts

- **`createPostgresBootstrapper()`** — Creates a bootstrapper that registers the Postgres data driver, auth repository, realtime service, and history service.
- **`bootstrappers: [...]`** — The `initializeRebaseBackend()` coordinator iterates over all bootstrappers, calling `initializeDriver()`, `initializeAuth()`, `initializeRealtime()`, and `initializeHistory()`.
- **`collectionsDir`** — Auto-discovers collection definition files from the specified directory.

## Important Notes

- **Never use `db:pull` then `db:migrate`** — introspected databases already have the tables
- **Always backup before production migrations** — `ALTER COLUMN` or `DROP COLUMN` can cause data loss
- **Tables not in schema are ignored** — custom tables and internal Rebase tables are safe
- **Review generated SQL** — always inspect the `.sql` files in `./drizzle/` before applying

## References

- **Migration Workflow:** See [references/migration-workflow.md](references/migration-workflow.md) for detailed steps.
- **Drizzle ORM Docs:** See [references/drizzle-guide.md](references/drizzle-guide.md) for Drizzle-specific guidance.
- **Troubleshooting:** See [references/troubleshooting.md](references/troubleshooting.md) for common database issues.

---
title: CLI Reference
sidebar_label: CLI
slug: docs/cli
description: Rebase CLI commands for project initialization, schema generation, database migrations, and SDK generation.
---

## Overview

The Rebase CLI (`rebase`) manages your project from scaffolding to deployment.

## Installation

```bash
npm install -g @rebasepro/cli
```

Or use via `npx`:

```bash
npx @rebasepro/cli <command>
```

## Commands

### `rebase init`

Initialize a new Rebase project:

```bash
rebase init [directory]
```

Sets up the project structure with frontend, backend, and shared packages.

### `rebase dev`

Start the development server:

```bash
rebase dev
```

Starts both frontend and backend with hot reloading.

### `rebase schema generate`

Generate Drizzle ORM schema from your TypeScript collections:

```bash
rebase schema generate
```

This reads your collections from `shared/collections/` and generates `backend/src/schema.generated.ts` with Drizzle table definitions, enums, and relations.

### `rebase db push`

Push schema changes directly to the database (development only):

```bash
rebase db push
```

:::caution
`db push` modifies the database directly without migration files. Use `db generate` + `db migrate` for production.
:::

### `rebase db generate`

Generate SQL migration files from schema changes:

```bash
rebase db generate
```

Creates timestamped migration files in `drizzle/` that can be reviewed and committed.

### `rebase db migrate`

Run pending database migrations:

```bash
rebase db migrate
```

Applies all unapplied migrations to the database.

### `rebase db studio`

Open Drizzle Studio to browse your database visually:

```bash
rebase db studio
```

### `rebase generate_sdk`

Generate a typed client SDK from your collection definitions:

```bash
rebase generate_sdk
```

Creates TypeScript types and a type-safe client for all your collections.

### `rebase auth`

Authentication management commands:

```bash
rebase auth create-user --email admin@example.com --password secret
rebase auth reset-password --email admin@example.com
```

## Migration Workflow

The typical workflow for schema changes:

```bash
# 1. Edit your collection in shared/collections/
# 2. Generate the Drizzle schema
rebase schema generate

# 3. Generate SQL migration
rebase db generate

# 4. Review the generated SQL in drizzle/

# 5. Apply the migration
rebase db migrate
```

## Next Steps

- **[Schema as Code](/docs/architecture/schema-as-code)** — How schema generation works
- **[Quickstart](/docs/getting-started/quickstart)** — Get started

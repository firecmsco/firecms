---
title: Quickstart
sidebar_label: Quickstart
slug: docs/getting-started/quickstart
description: Create a new Rebase project and get it running locally in under 2 minutes.
---

## Create a New Project

```bash
git clone https://github.com/rebasepro/rebase-starter my-app
```

This scaffolds a project with three packages:

| Folder | Description |
|--------|-------------|
| `frontend/` | React SPA — Vite + TypeScript with the Rebase admin UI |
| `backend/` | Node.js server — Hono, PostgreSQL via Drizzle ORM, WebSocket |
| `shared/` | TypeScript collection definitions shared by both sides |

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** — local install, Docker, or any managed Postgres (Neon, Supabase, RDS)
- **pnpm** (recommended) or npm

## Configure Your Environment

After scaffolding, edit the `.env` file at the project root:

```bash
# Database connection string
DATABASE_URL=postgresql://username:password@localhost:5432/your_database

# JWT secret for authentication (generate a strong random string)
JWT_SECRET=change-me-to-a-random-secret

# Frontend URL for CORS
VITE_API_URL=http://localhost:3001

# Optional: Google OAuth client ID
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Start the Dev Servers

```bash
pnpm dev
```

This starts:
- **Backend** at `http://localhost:3001` — REST API, auth, storage, WebSocket
- **Frontend** at `http://localhost:5173` — Rebase admin panel
- **Hot reload** for both — changes take effect instantly

You can also start them individually:

```bash
pnpm dev:backend   # Backend only
pnpm dev:frontend  # Frontend only
```

## First Login

When you open `http://localhost:5173`, you'll see the login screen. The **first user** to register automatically becomes an admin — this is the bootstrap flow.

1. Click **Sign Up**
2. Enter your email and password
3. You're in — with full admin access

## Define Your First Collection

Open `shared/collections/` and create a new file:

```typescript title="shared/collections/products.ts"
import { EntityCollection } from "@rebasepro/types";

export const productsCollection: EntityCollection = {
    slug: "products",
    name: "Products",
    singularName: "Product",
    table: "products",
    properties: {
        name: {
            type: "string",
            name: "Name",
            validation: { required: true }
        },
        price: {
            type: "number",
            name: "Price",
            validation: { required: true, min: 0 }
        },
        description: {
            type: "string",
            name: "Description",
            multiline: true
        },
        active: {
            type: "boolean",
            name: "Active",
            defaultValue: true
        },
        created_at: {
            type: "date",
            name: "Created At",
            autoValue: "on_create"
        }
    }
};
```

## Generate the Database Schema

```bash
rebase schema generate   # Generate Drizzle schema from your collections
rebase db push           # Push the schema to your database
```

Restart the dev servers and your new **Products** collection appears in the navigation.

## Database Commands Reference

| Command | Description |
|---------|-------------|
| `rebase schema generate` | Generate Drizzle schema from your TypeScript collections |
| `rebase db push` | Push schema changes directly to the database (dev only) |
| `rebase db generate` | Generate SQL migration files |
| `rebase db migrate` | Run pending migrations |

## What's Next

- **[Project Structure](/docs/getting-started/project-structure)** — Understand the generated code
- **[Collections](/docs/collections)** — Deep dive into schema definition
- **[Environment & Configuration](/docs/getting-started/configuration)** — All configuration options
- **[Deployment](/docs/getting-started/deployment)** — Deploy to production

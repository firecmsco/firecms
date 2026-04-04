---
slug: docs/database_setup
title: Database Setup
sidebar_label: Database Setup
description: Step-by-step guide to setting up your PostgreSQL database for Rebase, including database creation, environment configuration, migrations, and Row Level Security.
---

Rebase connects directly to your **PostgreSQL** database to provide a powerful **admin panel** for managing your data. Before you can use Rebase, you need to set up your Postgres database and configure the connection.

This guide covers the essential setup steps:
1. **PostgreSQL** — Your primary database
2. **Environment Configuration** — Connect Rebase to your database
3. **Migrations** — Set up your database schema
4. **Row Level Security (RLS)** — Protect your data

### PostgreSQL

You need a running PostgreSQL instance. You can use a local installation, a Docker container, or a managed service like:

- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
- [Railway](https://railway.app/)
- [AWS RDS](https://aws.amazon.com/rds/postgresql/)

:::tip
For local development, a simple Docker container works great:
```bash
docker run --name rebase-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=rebase -p 5432:5432 -d postgres:16
```
:::

### Environment Configuration

Configure your database connection in the `.env` file at the root of your project:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
```

:::important
Make sure your PostgreSQL user has sufficient permissions to create tables, run migrations, and manage RLS policies. For development, using a superuser is fine. For production, create a dedicated user with appropriate permissions.
:::

### Database Migrations

Rebase uses **Drizzle ORM** to manage your database schema. Your TypeScript collection definitions in the `shared/collections/` directory are the source of truth, and Drizzle generates the corresponding Postgres tables.

Common database commands:

```bash
# Generate schema from your collections
rebase schema generate

# Generate SQL migration files
rebase db generate

# Run database migrations
rebase db migrate

# Open Drizzle Studio to visually browse your database
rebase db studio
```

After defining or modifying a collection, run `rebase schema generate` followed by `rebase db push` for development or `rebase db generate` and `rebase db migrate` for production to apply the changes to your database.

### Row Level Security (RLS)

Rebase supports **Row Level Security (RLS)** policies defined directly in your collection configuration. RLS policies control which rows a user can read, insert, update, or delete based on their role or other conditions.

For example, in a `posts` collection, you might define a security rule that allows public read access:

```typescript
const postsCollection: EntityCollection = {
    name: "Posts",
    slug: "posts",
    dbPath: "posts",
    properties: {
        // ... your properties
    },
    securityRules: [
        {
            name: "Enable read access for all users",
            operation: "select",
            mode: "permissive",
            using: "true",
            roles: ["public"]
        }
    ]
};
```

These security rules are applied at the Postgres level, meaning they are enforced regardless of how the data is accessed — whether through Rebase or directly via SQL.

### Authentication

Rebase uses a built-in authentication system with JWT tokens. The backend handles user authentication and passes the user context to the database for RLS enforcement.

You can configure authentication providers (email/password, Google Sign-In) in your backend settings. See the [Authentication](/docs/self/auth_self_hosted) guide for more details.

### Storage

Rebase includes a built-in file storage system that works through the backend API. Files are stored on your server's filesystem (configurable via the `UPLOADS_PATH` environment variable). No external storage services are required by default.

If you need to use external storage (e.g., S3, Google Cloud Storage), see the [Custom Storage](/docs/self/custom_storage) guide.

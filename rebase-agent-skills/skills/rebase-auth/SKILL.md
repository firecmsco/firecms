---
name: rebase-auth
description: Guide for setting up and using Rebase Authentication, roles, and Row-Level Security (RLS) policies. Use this skill when the user needs to add authentication, manage users and roles, or secure data access with RLS policies.
---

# Rebase Authentication

Rebase provides built-in authentication with role-based access control (RBAC) and application-level Row-Level Security (RLS) for all auto-generated APIs.

## Core Concepts

### Users

Users are managed through the Rebase user management system. Each user has:
- `uid`: Unique identifier
- `email`: User's email address
- `displayName`: Display name
- `roles`: Array of role IDs assigned to the user

### Roles

Roles define what a user can see and do. Each role has:
- `id`: Unique string identifier (e.g., `"admin"`, `"editor"`, `"viewer"`)
- `name`: Human-readable name
- `isAdmin`: Boolean flag for full access

Roles are stored as string IDs on user objects and resolved to full role objects at runtime.

### RLS Policies (Row-Level Security)

Rebase implements **application-level** RLS policies (not PostgreSQL native RLS). These policies are evaluated by the backend before executing database operations.

#### Available Auth Context Functions

Inside RLS policy expressions, you have access to:

| Function | Returns | Description |
|----------|---------|-------------|
| `auth.uid()` | `string` | The authenticated user's UID |
| `auth.jwt()` | `object` | The decoded JWT token claims |
| `auth.roles()` | `string[]` | Array of role IDs assigned to the current user |

**Important:** These are custom functions injected by the Rebase backend, NOT standard PostgreSQL functions.

## Setting Up Authentication

### 1. Configure Auth in Backend

Auth is configured via the `auth` field in `initializeRebaseBackend()`:

```typescript
import { initializeRebaseBackend } from "@rebasepro/backend";

const backend = await initializeRebaseBackend({
    server,
    app,
    datasource: { connection: db, schema: { tables, enums, relations } },
    auth: {
        jwtSecret: process.env.JWT_SECRET!,
        accessExpiresIn: "1h",       // Access token TTL
        refreshExpiresIn: "30d",     // Refresh token TTL
        allowRegistration: false,    // First user can always register
        google: {                    // Optional: Google OAuth
            clientId: process.env.GOOGLE_CLIENT_ID!,
        },
    },
});
```

Auth tables (`rebase.users`, `rebase.roles`, etc.) are auto-created on first startup.

### 2. Define Roles

Roles can be defined in collection configuration or managed via the Studio UI:

```typescript
const roles = [
    { id: "admin", name: "Administrator", isAdmin: true },
    { id: "editor", name: "Editor", isAdmin: false },
    { id: "viewer", name: "Viewer", isAdmin: false },
];
```

### 3. Apply RLS Policies

RLS policies are defined per-collection to restrict data access:

```typescript
const postsCollection: EntityCollection = {
    name: "Posts",
    dbPath: "posts",
    rlsPolicies: {
        select: "auth.uid() IS NOT NULL",  // Any authenticated user can read
        insert: "'editor' = ANY(auth.roles())",  // Only editors can create
        update: "auth.uid() = author_id",  // Only the author can update
        delete: "'admin' = ANY(auth.roles())",  // Only admins can delete
    },
    properties: {
        // ...
    }
};
```

## User Management

### Via MCP Server

| Tool | Description |
|------|-------------|
| `list_users` | List all users and their roles |
| `add_user` | Invite a new user |
| `update_user_roles` | Change a user's assigned roles |
| `remove_user` | Remove a user |

### Via Studio UI

The Rebase Studio includes a built-in user management panel for visual role assignment.

## Dev Mode & Role Simulation

The Studio supports:
- **Dev/Editor mode toggle**: Switch between developer view and end-user preview
- **Effective Role simulation**: In Dev Mode, developers can select an "effective role" to preview exactly what a specific role can see and do

## References

- **RLS Policy Syntax:** See [references/rls-policies.md](references/rls-policies.md) for the full policy expression syntax.
- **Auth Configuration:** See [references/auth-config.md](references/auth-config.md) for all authentication options.
- **User Management API:** See [references/user-management.md](references/user-management.md) for programmatic user management.

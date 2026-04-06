---
slug: docs/features/sdk_generator
title: TypeScript SDK Generator
description: Generate a type-safe TypeScript SDK from your Rebase collection definitions. Get perfect auto-complete, typed CRUD methods, authentication, and admin management.
---

Generate a **type-safe TypeScript SDK** directly from your collection definitions. The SDK gives you auto-completed, collection-namespaced CRUD methods — similar to the Supabase client library — without writing any boilerplate. It includes built-in **authentication**, **session management**, and **admin user/role management**.

:::tip Why use the hybrid SDK?
- **Zero boilerplate** — Install a standard npm package, generate your static types, and you're good to go.
- **IDE auto-complete** — Perfect Typescript interfaces generated from your collections.
- **Built-in auth** — Sign in, sign up, token refresh, and session management out of the box
- **Admin management** — User and role CRUD with server-enforced access control
- **Consistent with your schema** — Re-run the generator whenever your collections change
:::

## Quick start

### 1. Install the runtime client package

Install the core client library in your application:

```bash
npm install @rebasepro/client
```

### 2. Generate the types

Use the Rebase CLI to scan your collection definitions and generate your `database.types.ts` type definition:

```bash
npx @rebasepro/cli generate-sdk --collections ./src/collections --output ./src/generated
```

This scans every exported `EntityCollection` in the given directory and produces a single `database.types.ts` file in the output folder.

### 3. Use the SDK

Import the client factory and inject your generated types:

```typescript
import { createRebaseClient } from '@rebasepro/client';
import type { Database } from './generated/database.types';

const rebase = createRebaseClient<Database>({
    baseUrl: 'http://localhost:3001',
});

// Sign in
const { user } = await rebase.auth.signInWithEmail('user@example.com', 'password');

// List records with filtering (FULLY TYPED!)
const { data, meta } = await rebase.collection('posts').find({
    limit: 10,
    where: { status: 'eq.published' },
    orderBy: 'created_at:desc',
});

// Or use the dynamic proxy syntax!
const post = await rebase.posts.findById(1);

// Create
const newPost = await rebase.collection('posts').create({
    title: 'Hello World',
    content: 'My first post',
});

// Update
await rebase.collection('posts').update(1, { title: 'Updated Title' });

// Delete
await rebase.collection('posts').delete(1);
```

## CLI options

| Option | Default | Description |
|---|---|---|
| `--collections` | `./collections` | Path to the directory containing your `EntityCollection` exports |
| `--output` | `./generated` | Output directory for the generated `database.types.ts` file |
| `--no-readme` | — | Skip generating the `README.md` usage guide |

### Example with all options

```bash
npx @rebasepro/cli generate-sdk \
    --collections ./app/shared/collections \
    --output ./app/frontend/src/types \
    --no-readme
```

## Authentication

The SDK includes a complete authentication module with automatic token management, session persistence, and auth state listeners.

### Sign in with email

```typescript
const { user } = await rebase.auth.signInWithEmail('user@example.com', 'password');
console.log('Welcome', user.displayName);
```

### Auth state listeners

Listen for sign-in, sign-out, and token refresh events:

```typescript
const unsubscribe = rebase.auth.onAuthStateChange((event, session) => {
    switch (event) {
        case 'SIGNED_IN':
            console.log('User signed in:', session?.user);
            break;
        case 'SIGNED_OUT':
            console.log('User signed out');
            break;
    }
});
```

### Auto-refresh behavior

Tokens are refreshed automatically **2 minutes before expiry**. No user action is needed. If the refresh fails (e.g., refresh token revoked), the user is signed out automatically.

On 401 responses from collection endpoints, the SDK transparently attempts a token refresh and retries the request once.

## Admin management

The SDK includes admin methods for managing users and roles. All write operations require the authenticated user to have the `admin` role — this is enforced on the backend.

### User management

```typescript
// List all users
const { users } = await rebase.admin.listUsers();

// Create a user
const { user } = await rebase.admin.createUser({
    email: 'newuser@example.com',
    displayName: 'New User',
    password: 'tempPassword123',
    roles: ['editor'],
});
```

:::caution
Admin operations require the authenticated user to have the `admin` role. The backend enforces this — unauthorized requests return a **403 error** as a `RebaseApiError`.
:::

## Filtering with `where`

The `where` parameter uses **PostgREST-style operators** for type-safe filtering:

| Operator | Meaning | Example |
|---|---|---|
| `eq` | Equals | `{ status: 'eq.published' }` |
| `neq` | Not equals | `{ status: 'neq.draft' }` |
| `gt` | Greater than | `{ age: 'gt.18' }` |
| `gte` | Greater or equal | `{ age: 'gte.18' }` |
| `lt` | Less than | `{ price: 'lt.100' }` |
| `lte` | Less or equal | `{ price: 'lte.100' }` |
| `in` | In list | `{ role: 'in.(admin,editor)' }` |
| `nin` | Not in list | `{ role: 'nin.(banned)' }` |
| `cs` | Array contains | `{ tags: 'cs.news' }` |
| `csa` | Array contains any | `{ tags: 'csa.(news,tech)' }` |

## Regenerating the Types

The generated `database.types.ts` is meant to be overwritten. Whenever you modify your collection definitions — add a property, change a relation, rename a collection — simply re-run the generator:

```bash
npx @rebasepro/cli generate-sdk --collections ./src/collections --output ./src/generated
```

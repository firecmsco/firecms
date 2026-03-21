---
slug: docs/pro/firestore_rules
title: Security Rules
sidebar_label: Security Rules
description: Configure Row Level Security (RLS) policies for Rebase PRO to protect user management and collection configuration data.
---

:::note
These rules apply specifically to the Rebase PRO plugins configuration. If you are using the community version
you are encouraged to write your own rules to secure your data.
:::

Rebase PRO uses **Row Level Security (RLS)** policies in PostgreSQL to manage user roles and permissions, as well as the
collection configuration. Security rules are defined directly in your collection definitions.

### Defining Security Rules

You can define security rules in your collection configuration using the `securityRules` property:

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
            name: "Enable read access for authenticated users",
            operation: "select",
            mode: "permissive",
            using: "auth.uid IS NOT NULL",
            roles: ["authenticated"]
        },
        {
            name: "Enable write access for admin users",
            operation: "all",
            mode: "permissive",
            using: "auth.role = 'admin'",
            roles: ["admin"]
        }
    ]
};
```

### How it works

Rebase translates your collection security rules into PostgreSQL RLS policies during the migration process. These policies are enforced at the database level, meaning they apply regardless of how the data is accessed.

### Managing RLS from the UI

Rebase PRO includes a built-in **RLS Editor** that allows you to view and manage your Row Level Security policies visually. You can:

- View existing RLS policies for each table
- Create, edit, and delete policies
- Toggle RLS on/off for specific tables

### User Management

The user management system stores user roles and permissions in the `__rebase_users` and `__rebase_roles` tables. These tables are automatically created when you set up the user management plugin.

The roles defined in the user management system are used to enforce permissions both in the frontend (through the CMS UI) and at the database level (through RLS policies).

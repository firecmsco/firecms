---
slug: docs/self/auth_self_hosted
title: Authentication and User Management
sidebar_label: Authentication and User Management
description: Instructions on how to set up authentication and user management for a self-hosted Rebase instance.
---

Rebase includes a built-in [User Management](/docs/pro/user_management) plugin with role-based permissions, team management, and user invitations. You can also implement custom authentication logic.


:::note

When you initialize a new Rebase project using the CLI, you might find a boilerplate authenticator in your `App.tsx` file. It's a standard Rebase interface and looks something like this (no need to hate Flanders!):

```typescript
const myAuthenticator: Authenticator<User> = useCallback(async ({
                                                                   user,
                                                                   authController
                                                               }) => {
    if (user?.email?.includes("flanders")) {
        // You can throw an error to prevent access
        throw Error("Stupid Flanders!");
    }
    console.log("Allowing access to", user);
    return true;
}, []);
```

This is just a placeholder to show you where to implement your own authentication logic. You can replace it with one of the authenticators described below.

:::


## Part 1: Basic User Management

This section covers how to create a `users` collection to manage users. This is the foundation for implementing permissions.

### Create a "Users" Collection

This collection will store your users.

```typescript
import { buildCollection, buildProperty } from "@rebasepro/core";

export type User = {
  name: string;
  email: string;
};

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    })
  }
});
```

:::tip
Don't forget to set up the appropriate Row Level Security (RLS) policies for the `users` table to control who can read and write to it.
:::

## Part 2: Role-Based Permissions

Now, let's add a `role` to our users and use it to control access.

### Step 1: Update the "Users" Collection with Roles

Add a `role` property to your `User` type and collection.

```typescript
import { buildCollection, buildProperty } from "@rebasepro/core";

export enum UserRole {
  admin = "admin",
  editor = "editor",
  viewer = "viewer",
}

export type User = {
  name: string;
  email: string;
  role: UserRole;
}

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    }),
    role: buildProperty({
      name: "Role",
      validation: { required: true },
      dataType: "string",
      enumValues: {
        admin: "Admin",
        editor: "Editor",
        viewer: "Viewer"
      }
    })
  }
});
```

### Step 2: Implement a Role-Based Authenticator

First, create a new file named `src/custom_authenticator.ts`. This file will contain your authentication logic.

**`src/custom_authenticator.ts`**
```typescript
import { Authenticator } from "@rebasepro/core";
import { User } from "./collections/users"; // Make sure to import your User type

export const roleBasedAuthenticator: Authenticator<User> = async ({
  user,
  authController,
  dataSource
}) => {
  if (!user?.email) return false;

  try {
    const userEntities = await dataSource.fetchCollection<User>({
      path: "users",
      filter: { email: ["==", user.email] }
    });

    if (userEntities && userEntities.length > 0) {
      const member = userEntities[0].values;
      authController.setExtra({
        role: member.role
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

Now, import the `roleBasedAuthenticator` in your `App.tsx` and pass it to the Rebase component.

**`src/App.tsx`**
```typescript
import { Rebase } from "@rebasepro/core";
import { roleBasedAuthenticator } from "./custom_authenticator";
import { usersCollection } from "./collections/users"; // Make sure to import your collections

// ... other imports

function App() {
    // ... other component logic

    return (
        <Rebase
            name={"My App"}
            authentication={roleBasedAuthenticator}
            collections={[usersCollection, /* ...other collections */]}
            // ... other props
        />
    );
}

export default App;
```

### Step 3: Apply Permissions to Collections

Use the `permissions` callback in your collections to control access based on the user's role.

```typescript
import { buildCollection } from "@rebasepro/core";
import { UserRole } from "./collections/users";

export const postsCollection = buildCollection({
  name: "Posts",
  path: "posts",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true, // All roles can read
      edit: userRole === UserRole.admin || userRole === UserRole.editor,
      create: userRole === UserRole.admin || userRole === UserRole.editor,
      delete: userRole === UserRole.admin
    };
  },
  // ... properties
});
```

## Part 3: Using Custom Claims for Permissions

An alternative to storing roles in the database is to use custom claims from your authentication provider.

### Step 1: Set Custom Claims

You need to set custom claims for a user from a backend environment. This is typically done in a server-side API endpoint.

```typescript
// Example API endpoint to set a role claim
import { setUserClaims } from "@rebasepro/backend";

export async function setUserRole(uid: string, role: string) {
  await setUserClaims(uid, { role });
  return { message: `Success! User ${uid} has been given the role of ${role}.` };
}
```

### Step 2: Implement a Claims-Based Authenticator

This authenticator reads the custom claims from the user's session.

```typescript
import { Authenticator } from "@rebasepro/core";

export const claimsAuthenticator: Authenticator<any> = async ({
  user,
  authController
}) => {
  if (!user) return false;

  try {
    const role = user.claims?.role || "viewer"; // Default to 'viewer' if no role claim
    authController.setExtra({ role });
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

### Step 3: Use Claims in Collections

The `permissions` implementation is the same as with the role-based approach, as the role is extracted and placed in `authController.extra`.

```typescript
import { buildCollection } from "@rebasepro/core";

export const articlesCollection = buildCollection({
  name: "Articles",
  path: "articles",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true,
      edit: userRole === "admin" || userRole === "editor",
      create: userRole === "admin" || userRole === "editor",
      delete: userRole === "admin"
    };
  },
  // ... properties
});
```

## Security Best Practices

- **Row Level Security (RLS)**: Always enforce RLS policies in your Postgres database. Client-side permissions are for UI/UX purposes and can be bypassed.
- **Server-Side Validation**: For critical operations, validate permissions on a server.
- **Principle of Least Privilege**: Grant users the minimum level of access they need.

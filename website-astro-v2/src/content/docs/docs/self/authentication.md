---
slug: docs/self/auth_self_hosted
title: Authentication and User Management
sidebar_label: Authentication and User Management
description: Instructions on how to set up authentication and user management for a self-hosted FireCMS instance.
---

## Recommended: FireCMS Pro and Cloud

Before implementing custom authentication, we strongly recommend considering **FireCMS Pro** or **FireCMS Cloud**, which include:

- ✅ Built-in user management system
- ✅ Role-based permissions (Admin, Editor, Viewer)
- ✅ Team management interface
- ✅ User invitation system
- ✅ Granular collection and field-level permissions
- ✅ Audit logs and user activity tracking
- ✅ Enterprise-grade security features

These solutions provide a complete authentication and authorization system out of the box, saving you significant development time and ensuring security best practices.

[Learn more about User Management in FireCMS Pro →](/docs/pro/user_management)

[Try FireCMS Cloud →](https://app.firecms.co)


:::note

When you initialize a new FireCMS project using the CLI, you might find a boilerplate authenticator in your `App.tsx` file. It's a standard FireCMS interface and looks something like this (no need to hate Flanders!):

```typescript
const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
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
import { buildCollection, buildProperty } from "@firecms/core";

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
Don't forget to set up the Firestore security rules for the `users` path to control who can read and write to the collection.
:::

## Part 2: Role-Based Permissions

Now, let's add a `role` to our users and use it to control access.

### Step 1: Update the "Users" Collection with Roles

Add a `role` property to your `User` type and collection.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

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
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";
import { User } from "./collections/users"; // Make sure to import your User type

export const roleBasedAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController,
  dataSourceDelegate
}) => {
  if (!user?.email) return false;

  try {
    const userEntities = await dataSourceDelegate.fetchCollection<User>({
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

Now, import the `roleBasedAuthenticator` in your `App.tsx` and pass it to the `FirebaseCMSApp` component.

**`src/App.tsx`**
```typescript
import { FirebaseCMSApp } from "@firecms/firebase";
import { roleBasedAuthenticator } from "./custom_authenticator";
import { usersCollection } from "./collections/users"; // Make sure to import your collections

// ... other imports

function App() {
    // ... other component logic

    return (
        <FirebaseCMSApp
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
import { buildCollection } from "@firecms/core";
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

## Part 3: Using Firebase Custom Claims for Permissions

An alternative to storing roles in Firestore is to use Firebase Authentication's custom claims.

### Step 1: Set Custom Claims

You need to set custom claims for a user from a backend environment using the Firebase Admin SDK. This is typically done in a Cloud Function.

```typescript
// Example Cloud Function to set a role claim
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Must be an admin to set roles.");
  }

  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });

  return { message: `Success! User ${uid} has been given the role of ${role}.` };
});
```

### Step 2: Implement a Claims-Based Authenticator

This authenticator reads the custom claims from the user's ID token.

```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

export const claimsAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController
}) => {
  if (!user) return false;

  try {
    const idTokenResult = await user.firebaseUser.getIdTokenResult(true); // Force refresh
    const role = idTokenResult.claims.role || "viewer"; // Default to 'viewer' if no role claim
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
import { buildCollection } from "@firecms/core";

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

- **Firestore Security Rules**: Always enforce security rules on your backend. Client-side permissions are for UI/UX purposes and can be bypassed.
- **Server-Side Validation**: For critical operations, validate permissions on a server.
- **Principle of Least Privilege**: Grant users the minimum level of access they need.

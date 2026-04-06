---
title: Authentication
sidebar_label: Authentication
slug: docs/auth
description: Configure JWT authentication, Google OAuth, user management, and role-based access control.
---

## Overview

Rebase includes a complete authentication system:

- **JWT tokens** — Access and refresh token flow
- **Google OAuth** — Sign in with Google
- **User management** — Signup, login, password reset
- **Role-based access** — Assign roles to users, check permissions in collections
- **Auto-bootstrapping** — First user automatically gets admin role

## Backend Configuration

```typescript
await initializeRebaseBackend({
    // ...
    auth: {
        jwtSecret: process.env.JWT_SECRET!,  // Required
        accessExpiresIn: "1h",               // Access token lifetime
        refreshExpiresIn: "30d",             // Refresh token lifetime
        requireAuth: true,                   // Require auth for data API
        allowRegistration: false,            // Allow new signups
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID  // Optional
        },
        email: {                             // Optional — for password reset
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            smtpUser: "noreply@example.com",
            smtpPass: "app-password",
            from: "Rebase <noreply@example.com>"
        }
    }
});
```

Auth tables (`rebase.users`, `rebase.roles`, `rebase.user_roles`, `rebase.refresh_tokens`) are **auto-created** on first startup.

## Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login with email/password |
| `POST` | `/api/auth/refresh` | Refresh the access token |
| `POST` | `/api/auth/google` | Login with Google OAuth token |
| `POST` | `/api/auth/logout` | Revoke refresh token |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |

## Frontend Setup

### Auth Controller

```typescript
import { useRebaseAuthController } from "@rebasepro/auth";
import { createRebaseClient } from "@rebasepro/client";

const client = createRebaseClient({ baseUrl: API_URL, websocketUrl: WS_URL });

const authController = useRebaseAuthController({
    client,
    googleClientId: GOOGLE_CLIENT_ID  // Optional
});

// Available properties:
authController.user          // Current user object (or null)
authController.initialLoading // True while checking stored session
authController.signOut()     // Log out
authController.getAuthToken() // Get current JWT for API calls
```

### Login View

```tsx
import { RebaseLoginView } from "@rebasepro/auth";

if (!authController.user) {
    return (
        <RebaseLoginView
            authController={authController}
            googleEnabled={!!GOOGLE_CLIENT_ID}
            googleClientId={GOOGLE_CLIENT_ID}
        />
    );
}
```

## User & Role Management

### Backend Services

After initialization, the backend instance provides `userService` and `roleService`:

```typescript
const { userService, roleService } = instance;

// List all users
const users = await userService.listUsers();

// Assign a role
await roleService.assignRole(userId, roleId);
```

### Frontend Components

Rebase provides built-in views for managing users and roles:

```tsx
import { UsersView, RolesView } from "@rebasepro/core";
import { useBackendUserManagement } from "@rebasepro/auth";

const userManagement = useBackendUserManagement({
    client: rebaseClient,
    currentUser: authController.user
});

// In your routes:
<Route path="/users" element={<UsersView userManagement={userManagement} />} />
<Route path="/roles" element={<RolesView userManagement={userManagement} />} />
```

![User management interface](/img/user_management.png)

## Role Simulation (Dev Mode)

In developer mode, you can simulate different roles without logging out:

```typescript
import { useBuildEffectiveRoleController } from "@rebasepro/core";

const effectiveRoleController = useBuildEffectiveRoleController();

// When active, the UI behaves as if the current user has this role
effectiveRoleController.setEffectiveRole("editor");
```

## First User Bootstrap

When no users exist in the database, the first person to register automatically becomes an admin. After that, registration is controlled by the `allowRegistration` setting.

This ensures you can always bootstrap a fresh deployment without needing to seed the database manually.

## Next Steps

- **[Storage](/docs/storage)** — File storage configuration
- **[Collections](/docs/collections)** — Permissions per collection

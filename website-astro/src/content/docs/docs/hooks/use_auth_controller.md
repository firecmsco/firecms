---
slug: docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Please note that in order to use these hooks you **must** be in
a component (you can't use them directly from a callback function).
Anyhow, callbacks usually include a `FireCMSContext`, which includes all
the controllers.
:::

## `useAuthController`

Hook for accessing the authentication state and performing auth-related operations.
Works with any backend (Firebase, MongoDB, or custom implementations).

The props provided by this hook are:

* `user` The currently logged-in user object, or `null` if not authenticated
* `initialLoading` Initial loading flag, used to avoid showing login screen before auth state is determined
* `authLoading` Is the login/logout process ongoing
* `signOut()` Sign out the current user
* `authError` Error during authentication initialization
* `authProviderError` Error dispatched by the auth provider
* `getAuthToken()` Retrieve the auth token for the current user (returns a Promise)
* `loginSkipped` Has the user skipped the login process
* `extra` Additional data stored in the auth controller (useful for roles, permissions, etc.)
* `setExtra(extra)` Set additional data in the auth controller
* `setUser(user)` Programmatically set the current user (optional, implementation-dependent)
* `setUserRoles(roles)` Set user roles (optional, implementation-dependent)

Example:

```tsx
import React from "react";
import { useAuthController } from "@firecms/core";

export function ExampleCMSView() {

    const authController = useAuthController();

    if (authController.authLoading) {
        return <div>Loading...</div>;
    }

    return (
        authController.user ?
            <div>Logged in as {authController.user.displayName}</div>
            :
            <div>You are not logged in</div>
    );
}
```


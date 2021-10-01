---
id: use_auth_controller
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
For state and operations regarding authentication.

The props provided by this context are:

* `user` The Firebase user currently logged in or null
* `authProviderError` Error dispatched by the auth provider
* `authLoading` Is the login process ongoing
* `loginSkipped` Is the login skipped
* `notAllowedError` The current user was not allowed access
* `skipLogin()` Skip login
* `signOut()` Sign out

Example:

```tsx
import React from "react";
import { useAuthController } from "dist/index";

export function ExampleCMSView() {

    const authController = useAuthController();

    return (
        authController.user ?
            <div>Logged in as {authController.user.displayName}</div>
            :
            <div>You are not logged in</div>
    );
}
```


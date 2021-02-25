---
id: auth_context
title: Auth Context
sidebar_label: Auth Context
---

`useAuthContext`
For state and operations regarding authentication.

The props provided by this context are:

* `loggedUser` The Firebase user currently logged in or null
* `authProviderError` Error dispatched by the auth provider
* `authLoading` Is the login process ongoing
* `loginSkipped` Is the login skipped
* `notAllowedError` The current user was not allowed access
* `skipLogin()` Skip login
* `signOut()` Sign out

Example:

```tsx

import React from "react";
import { useAuthContext } from "dist/index";

export function ExampleCMSView() {

    const authController = useAuthContext();

    return (
        authController.loggedUser ?
            <div>Logged in as {authController.loggedUser.displayName}</div>
            :
            <div>You are not logged in</div>
    );
}
```

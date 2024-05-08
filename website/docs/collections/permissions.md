---
id: permissions
title: Permissions
sidebar_label: Permissions
---

You can define the `edit`, `create` and `delete` permissions at the collection
level, also depending on the logged-in user.

These define the actions that the logged user can perform over an entity.

### Simple permissions

In the simpler case, you can directly assign the permissions

```tsx
import { buildCollection } from "@firecms/cloud";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: {
        edit: true,
        create: true,
        delete: false
    }
});
```

### Advanced permissions

You can customise the permissions based on the user that is logged in, or any
other criteria that fits your use case.

You can use a `PermissionBuilder`, like in the example below, to customise the
actions based on the logged user.

In the example below we check if we have previously saved the role "admin"
in the extras field in the `AuthController`.

```tsx
import { buildCollection } from "@firecms/cloud";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: ({
                      entity,
                      path,
                      user,
                      authController,
                      context
                  }) => {
        const isAdmin = authController.extra?.roles.includes("admin");
        return ({
            edit: isAdmin,
            create: isAdmin,
            delete: isAdmin
        });
    }
});
```

Note that you can set the `extra` parameter in the `AuthController` to any data
that makes sense to you. Suggested places where you may want to set that
parameter are `Authenticator` since it is initialised
before the rest of the app.

Quick example of how the `extra.roles` field in the previous example is
initialised:

```tsx
import { Authenticator, FirebaseUserWrapper } from "@firecms/cloud";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    // This is an example of retrieving async data related to the user
    // and storing it in the controller's extra field
    const sampleUserData = await Promise.resolve({
        roles: ["admin"]
    });
    authController.setExtra(sampleUserData);

    console.log("Allowing access to", user);
    return true; // Allow
};
```


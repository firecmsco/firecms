---
id: dynamic_collections
title: Dynamic collections
sidebar_label: Dynamic collections
---

You can change the collections based on the logged-in user, by using an
asynchronous callback. Using an async `EntityCollectionsBuilder` you can
also fetch some data in order to build your collections dynamically.

You can also fetch data to create custom properties, for example, if you
want to use the ids of a collection as the enum values of a `string`.

```tsx
import { useCallback } from "react";
import {
// ...
    EntityCollectionsBuilder,
} from "firecms";

// ...

const collectionsBuilder: EntityCollectionsBuilder = useCallback(async ({
                                                                            user,
                                                                            authController,
                                                                            dataSource
                                                                        }) =>
    ({
        collections: [
            buildCollection({
                path: "products",
                properties: {}, // ...
                name: "Products"
            })
        ]
    }), []);
```

:::note
If you want to make customizations at the property level only, check the
[conditional fields](../properties/conditional_fields.md) section.
:::

### Use in conjunction with authentication

The `AuthController` handles the auth state. It can also be used to store any
arbitrary object related to the user.

A typical use case is to store some additional data related to the user, for
example, the roles or the permissions.

```tsx
import { useCallback } from "react";

const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                            user,
                                                                            authController
                                                                        }) => {

    if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
    }

    console.log("Allowing access to", user?.email);
    // This is an example of retrieving async data related to the user
    // and storing it in the user extra field.
    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
}, []);
```

Then you can access the extra data in the `collectionsBuilder` callback.

```tsx
const collectionsBuilder: EntityCollectionsBuilder = useCallback(async ({
                                                                            user,
                                                                            authController,
                                                                            dataSource
                                                                        }) => {

    const userRoles = authController.extra;

    if (userRoles?.includes("admin")) {
        return {
            collections: [
                buildCollection({
                    path: "products",
                    properties: {}, // ...
                    name: "Products"
                })
            ]
        };
    } else {
        return {
            collections: []
        };
    }
}, []);
```

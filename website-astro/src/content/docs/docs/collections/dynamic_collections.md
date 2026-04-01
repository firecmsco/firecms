---
slug: docs/collections/dynamic_collections
title: Dynamic collections
sidebar_label: Dynamic collections
description: Tailor the Rebase UI to your logged-in users with Dynamic Collections. While the backend database schema is strictly typed, Rebase allows you to dynamically adjust the presentation, visibility, and properties of your collections using asynchronous callbacks in the frontend. Through strategic utilization of EntityCollectionsBuilder and AuthController, you can build intelligent, role-specific interfaces and populate UI elements asynchronously.
---

While Rebase relies on a statically generated backend schema (powered by Firebase Data Connect and PostgreSQL), the **presentation** of your collections in the CMS can be extremely dynamic. This means you can adjust which collections are visible, configure field options, or populate UI elements asynchronously based on the logged-in user or data from other collections.

:::important
Dynamic collections in Rebase are a **frontend concept**. You cannot create new database tables or columns on the fly. Any properties or collections returned by your dynamic builder must perfectly map to your generated static backend schema.
:::

Instead of defining your collections as a static array, use an `EntityCollectionsBuilder`—a function that returns a promise of an object containing the collections.

```tsx
import { EntityCollectionsBuilder } from "@rebasepro/core";

// ...

const collectionsBuilder: EntityCollectionsBuilder = async ({
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
    });
```

:::note
If you want to make customizations at the property level only, check the
[conditional fields](../properties/conditional_fields) section. But note that conditional fields are not
suitable for asynchronous operations.
:::

### Fetch data from a different collection

It may be the case that a collection config depends on the data of another
one. For example, you may want to fetch the enum values of a property from
a different collection.

In this example we will fetch data from a collection called `categories` and
use it to populate the enum values of a property called `category`, in the `products`
collection.

```tsx
import { useCallback } from "react";
import { buildCollection, EntityCollectionsBuilder } from "@rebasepro/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {

    // let's assume you have a database collection called "categories"
    const categoriesData: Entity<any>[] = await dataSource.fetchCollection({
        path: "categories"
    });

    return {
        collections: [
            buildCollection({
                id: "products",
                path: "products",
                properties: {
                    // ...
                    category: {
                        dataType: "string",
                        name: "Category",
                        // we can use the enumValues property to define the enum values
                        // the stored value will be the id of the category
                        // and the UI label will be the name of the category
                        enum: categoriesData.map((category: any) => ({
                            id: category.id,
                            label: category.values.name
                        }))
                    }
                    // ...
                },
                name: "Products"
            })
        ]
    }
};

```

### Use in conjunction with authentication

The `AuthController` handles the auth state. It can also be used to store any
arbitrary object related to the user.

A typical use case is to store some additional data related to the user, for
example, the roles or the permissions.

```tsx
import { useCallback } from "react";

const myAuthenticator: Authenticator<User> = useCallback(async ({
                                                                            user,
                                                                            authController
                                                                        }) => {

    if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
    }

    console.log("Allowing access to", user?.email);
    // This is an example of retrieving async data related to the user
    // and storing it in the controller's extra field.
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

### Where to use the `collectionsBuilder`

Use the `collectionsBuilder` in the `useBuildNavigationController` hook:

```tsx
const navigationController = useBuildNavigationController({
    collections: collectionsBuilder
});
```

---
id: dynamic_collections
title: Dynamic collections
sidebar_label: Dynamic collections
description: Unlock personalized content management with Dynamic Collections in FireCMS, where collections can adapt to the logged-in user's profile using asynchronous callbacks. Tailor your CMS with custom properties built on-the-fly, ensuring a highly responsive and secure environment that aligns with user roles and permissions. Through strategic utilization of `EntityCollectionsBuilder` and `AuthController`, dynamically generate data schemas suitable for each user, enhancing their CMS experience with intelligent, role-specific interfaces.
---

FireCMS offers the possibility to define collections dynamically. This means
that collections can be built asynchronously, based on the logged-in user,
based on the data of other collections, or based on any other arbitrary
condition.

Instead of defining your collections as an array, use a `EntityCollectionsBuilder`,
a function that returns a promise of an object containing the collections.

```tsx
import { EntityCollectionsBuilder, } from "@firecms/cloud";

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
[conditional fields](../properties/conditional_fields.md) section. But note that conditional fields are not
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
import { buildCollection, EntityCollectionsBuilder } from "@firecms/cloud";

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
                        enumValues: categoriesData.map((category: any) => ({
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

const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
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

In the **Cloud version** of FireCMS, simply add the `collectionsBuilder` to the `collections` prop of your main app
config.

```tsx

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    return {
        collections: [] // your collections here
    };
};

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: collectionsBuilder
};
```

---
id: navigation
title: Navigation
sidebar_label: Navigation
---

FireCMS takes care of the navigation for you, it generates routes and menus based
on the configuration that you set up.

:::tip
The collections can be defined asynchronously, so you can fetch data from your backend
to build them.
It might be useful if you want to build the collections based on the logged-in user,
or if you want to fetch some data to build the schema of your collections.
:::

You have two main ways of creating the top level views in FireCMS, either creating entity
collections that get mapped to CMS views, or create your own top level React views.

:::note
Check all the possible configurations for defining [collections](../collections/collections.md)
:::

Otherwise, you can define your own [custom top level views](./custom_top_level_views.mdx).

You can change the collections based on the logged-in user, by using an
asynchronous callback. Using an async `EntityCollectionsBuilder` you can
also fetch some data in order to build your collections dynamically.
Let's say you have a collection called `subscriptions` and would
like to use its ids as the enum values of a `string` property; you can fetch
them and then build the schema with them.

```tsx
import {
    // ...
    EntityCollectionsBuilder,
} from "firecms";

// ...

const collectionsBuilder:EntityCollectionsBuilder = async ({ authController }) => ({
    collections: [
        buildCollection({
            path: "products",
            properties: {}, // ...
            name: "Products"
        })
    ]
});
```

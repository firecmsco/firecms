---
slug: docs/collections/collection_groups
title: Collection Groups
sidebar_label: Collection Groups
---

Collection groups allow you to query across related tables that share a common structure. For example, you could
have a `locales` subcollection that exists under different product entities, and query all locales at once.

Rebase will generate an additional column in the collection view with
references to all the parent collections that are part of the
configuration.

In order to use collection groups, you need to specify the `collectionGroup`
property in the `Collection` configuration.

```tsx
export const localeCollectionGroup = buildCollection({
    name: "Product locales group",
    path: "locales",
    description: "This is a collection group related to the locales subcollection of products",
    collectionGroup: true,
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        // ...
    },
});
```

:::note
When using collection groups with Postgres, the data source will query the relevant table
and join with parent tables as needed. Make sure your database schema supports the 
relationships you're querying.
:::

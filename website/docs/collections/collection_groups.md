---
id: collection_groups
title: Collections Groups
sidebar_label: Collections Groups
---

You can now use Firestore collection groups in FireCMS. This allows you to
query across multiple collections with the same name. For example, you could
have a collection group called `products` that contains all the products
from different `stores`.

In our demo project, we have a collection group called `locales` that
contains all the locales for the different `products`.

See the demo project [here](https://demo.firecms.co/c/locales).

FireCMS will generate an additional column in the collection view to
with references to all the parent collections that are part of the
configuration.

In order to use collection groups, you need to specify the `collectionGroup`
property in the `Collection` configuration.

```tsx
export const localeCollectionGroup = buildCollection({
    ...localeCollection,
    name: "Product locales group",
    description: "This is a collection group related to the locales subcollection of products",
    group: "Main",
    collectionGroup: true
});
```

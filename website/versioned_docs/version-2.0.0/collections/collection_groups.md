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
Depending on your Firestore rules, you may need to add another
rule to allow collection group queries. For example:

```text
match /{path=**}/locales/{document=**} {
  allow read, write: if true;
}
```

When doing a collection group query, the path will be something like
`/products/{productId}/locales/{localeId}`. But the query will go to all 
the collections called `locales` in your database. That is why you might need
to add a rule like the one above.
:::

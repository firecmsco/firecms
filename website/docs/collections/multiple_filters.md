---
id: multiple_filters
title: Multiple filters in collection views
sidebar_label: Multiple filters
---

Unfortunately Firestore is limited to a single `where` clause per query by default.
This means that filtering by multiple fields is not possible out of the box.

Anyhow, you can define indexes in Firestore to allow queries per multiple fields.
This is a limitation of Firestore, not of FireCMS.

:::note
Firestore and FireCMS allow certain queries without indexes, but they are limited.
For example, you can filter by a single field, or by multiple fields if you are
filtering by equality (but not other operators like `>`, `<`, `>=`, `<=`).
Check the [Firestore documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
:::

FireCMS allows you to define multiple filters if you specify it using a `FirestoreIndexesBuilder`.
This is a builder that allows you to declare your Firestore indexes.

This callback will be called with the current path of the collection being rendered.
You can then return an array of indexes that will be used to filter the collection.

```tsx
import { FirebaseCMSApp, FirestoreIndexesBuilder } from "@firecms/core";

// Sample index builder that allows filtering by `category` and `available` for the `products` collection
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // For 2 fields, you need to define 4 indexes (I know...)
        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

// Add your indexes builder to your app
function MyApp() {

    return <FirebaseCMSApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}

```


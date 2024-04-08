---
id: multiple_filters
title: Multiple filters in collection views
sidebar_label: Multiple filters
---

Firestore is a bit limited when filtering and sorting. limited to a single `where` clause per query by default.
This means that filtering by multiple fields is not possible out of the box. This is a limitation of Firestore, not of
FireCMS.

:::important
Since FireCMS 3.0, if you don't define indexes manually, FireCMS will attempt to run your query anyway, if it fails
it will show a link to the Firestore console to create the required indexes.
:::

If you want to restrict the UI operations that can be performed in a collection, based on your existing indexes, you can
define them in FireCMS, by using a `FirestoreIndexesBuilder`. This is a builder that allows you to declare your Firestore indexes.
If you define your indexes, FireCMS will only allow you to filter by the fields you have defined, or the fields that can
be filtered and sorted without indexes.

:::note
Firestore and FireCMS allow certain queries without indexes, but they are limited.
For example, you can filter by a single field, or by multiple fields if you are
filtering by equality (but not other operators like `>`, `<`, `>=`, `<=`).
Check the [Firestore documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
:::


This is an example of how you can define a `FirestoreIndexesBuilder`.
You can then return an array of indexes that will be used to filter the collection.

```tsx
import { FireCMSCloudApp, FirestoreIndexesBuilder } from "@firecms/cloud";

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

    return <FireCMSCloudApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}

```


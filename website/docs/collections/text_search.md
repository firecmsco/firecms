---
id: text_search
title: Text search
description: Enhance your FireCMS experience with integrated text search capabilities, despite Firestore's lack of native support for this feature. By setting the `textSearchEnabled` flag on your collection, you activate a search bar within the collection view, powered by a `FirestoreTextSearchController`. Integrate with external platforms like Algolia for indexing and provide seamless search functionality through our provided utility method for Algolia searches. Configure your custom FirestoreTextSearchController, link it with your Algolia account, and enable advanced text search across your collections for a more robust and intuitive content management system.
---

:::note The solution described here is specific for Firestore
If you are developing your own datasource, you are free to implement text search in
whatever way it makes sense.
:::

Firestore does not support native text search, so we need to rely on external
solutions. If you specify a `textSearchEnabled` flag to the **collection**, you
will see a search bar on top of the collection view.

You need to define a `FirestoreTextSearchControllerBuilder` and add it to your config.
Typically, you will want to index your entities in some external
solution, such as Algolia. For this to work you need to set up an AlgoliaSearch
account and manage the indexing of your documents.

You can achieve this by implementing a Google Cloud Function that listens to
Firestore changes and updates the Algolia index.
There is also a [Firebase extension](https://extensions.dev/extensions/algolia/firestore-algolia-search) 
for the very same purpose.


### Using Algolia in FireCMS Cloud

We provide a utility method for performing searches in
Algolia `performAlgoliaTextSearch`

Example:

```tsx
import algoliasearch, { SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    FirestoreTextSearchController,
    buildCollection,
    buildCollection,
    FireCMSCloudApp,
    EntityCollectionsBuilder
} from "@firecms/cloud";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const productsIndex = client.initIndex("products");

const textSearchController: FirestoreTextSearchController =
    ({
         path,
         searchString
     }) => {
        if (path === "products")
            return performAlgoliaTextSearch(productsIndex, searchString);
        return undefined;
    };

export default function App() {

    const productCollection = buildCollection({
        path: "products",
        name: "Products",
        textSearchEnabled: true,
        properties: {
            name: {
                dataType: "string",
                name: "Name",
                validation: { required: true }
            }
        }
    });

    return <FireCMSCloudApp
        name={"My Online Shop"}
        collections={[productCollection]}
        textSearchController={textSearchController}
        firebaseConfig={firebaseConfig}
    />;
}
```

### Using Algolia in FireCMS PRO

For FireCMS PRO, you need to define a `FirestoreTextSearchControllerBuilder`.

```tsx
import algoliasearch, { SearchClient } from "algoliasearch";

import { buildAlgoliaSearchController, performAlgoliaTextSearch } from "@firecms/firebase";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const productsIndex = client && client.initIndex("products");

export const algoliaSearchControllerBuilder = buildAlgoliaSearchController({
    isPathSupported: (path) => {
        return ["products"].includes(path);
    },
    search: ({
                 path,
                 searchString
             }) => {
        if (path === "products")
            return productsIndex && performAlgoliaTextSearch(productsIndex, searchString);
        return undefined;
    }
});


export function App() {

    // ...
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: algoliaSearchControllerBuilder
    });
    // ...
}

```


### Local text search

Since FireCMS v3 we provide a local text search implementation. This is useful
for small collections or when you want to provide a quick way to search through
your data.

However, for larger collections, you will want to use an external search
provider, such as Algolia. This is the recommended approach.

You can use local text search in FireCMS Cloud, or in self-hosted versions.

For FireCMS Cloud, you just need to enable it with the UI.

For self-hosted versions, you can enable it by setting the `localTextSearchEnabled` in `useFirestoreDelegate`.
Then you need to mark each collection with `textSearchEnabled: true`.

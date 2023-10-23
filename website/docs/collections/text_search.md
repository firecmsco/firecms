---
id: text_search 
title: Text search
---

:::note The solution described here is specific for Firestore
If you are
developing your own datasource, you are free to implement text search in
whatever way it makes sense.
:::

Firestore does not support native text search, so we need to rely on external
solutions. If you specify a `textSearchEnabled` flag to the **collection**, you
will see a search bar on top of the collection view.

You need to define a `FirestoreTextSearchController` and pass it to your
`FirebaseCMSApp` component (or `useFirestoreDataSource` if you are building a
custom app). Typically, you will want to index your entities in some external
solution, such as Algolia. For this to work you need to set up an AlgoliaSearch
account and manage the indexing of your documents. 

There is a full backend
example included in the source code, which indexes documents with Cloud Functions. 
There is also a Firebase extension for the very same purpose.

:::note 
Find all the available props
for `FirebaseCMSApp` [here](../navigation/app_config)
:::

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
    FirebaseCMSApp,
    EntityCollectionsBuilder
} from "@firecms/core";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const productsIndex = client.initIndex("products");

const textSearchController: FirestoreTextSearchController =
    ({ path, searchString }) => {
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

    return <FirebaseCMSApp
        name={"My Online Shop"}
        collections={[productCollection]}
        textSearchController={textSearchController}
        firebaseConfig={firebaseConfig}
    />;
}
```

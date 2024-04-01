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

You need to define a `FirestoreTextSearchController` and pass it to your app config.
Typically, you will want to index your entities in some external
solution, such as Algolia. For this to work you need to set up an AlgoliaSearch
account and manage the indexing of your documents.

There is a full backend
example included in the source code, which indexes documents with Cloud Functions.
There is also a Firebase extension for the very same purpose.

### Local text search

Since FireCMS v3 we provide a local text search implementation. This is useful
for small collections or when you want to provide a quick way to search through
your data.

However, for larger collections, you will want to use an external search
provider, such as Algolia. This is the recommended approach.



### Using Algolia

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

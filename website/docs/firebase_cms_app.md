---
id: firebase_cms_app
title: FirebaseCMSApp
sidebar_label: FirebaseCMSApp
---

FireCMS works as a complete app that is in charge of creating the views that
you define based on your collections and entity schemas. It handles
navigation for you as well as authentication and login.

However, there is a lot of room to customization, including [custom top level views](custom_top_level_views.md),
[custom schema views](entities/custom_schema_views.md), and [custom fields](entities/custom_fields.md)
for your entity properties, in case the basic use cases we include don't suit your needs.

In the simplest case, you will want to create some properties, include them
in an entity schema, include it in a collection and include that in a CMS
instance.

## FirebaseCMSApp

The entry point for setting up a FireCMS app based on Firebase is the `FirebaseCMSApp`.
This component is in charge of building a full FireCMS instance, using Firebase Auth,
Firestore, and Firebase Storage as backend services.

Internally it will create a `FireCMS` which holds the main state and
logic of the app, and create the app scaffold and routes.

:::note
It is also possible to use FireCMS by using lower level components and including
`FireCMS` in your code, even without using Firebase.
More details in the [Custom CMSApp](custom_cms_app.md) section
:::

You can find an example of a basic `FirebaseCMSApp` implementation in the
[quickstart section](quickstart.md)

### Text search

Firestore does not support native text search, so we need to rely on external
solutions. If you specify a `textSearchEnabled` flag to the collection view, you
will see a search bar on top of the collection view.

:::note
The solution described here is specific for Firestore, if you are
developing your own datasource, you are free to implement text search in
whatever way it makes sense.
:::

:::note
Find all the available props for `FirebaseCMSApp` [here](./api/functions/firebasecmsapp.md)
:::

You need to define a `FirestoreTextSearchController` and pass it to your
`FirebaseCMSApp` component (or `useFirestoreDataSource` if you are building a
custom app). Typically, you will want to index your entities in some external
solution, such as Algolia. For this to work you need to set up an AlgoliaSearch
account and manage the indexing of your documents. There is a full backend
example included in the code, which indexes documents with Cloud Functions.

We provide a utility method for performing searches in Algolia `performAlgoliaTextSearch`

Example:
```tsx
import algoliasearch, { SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    FirestoreTextSearchController,
    buildSchema,
    buildCollection,
    FirebaseCMSApp,
    NavigationBuilder,
    NavigationBuilderProps
} from "@camberi/firecms";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const productsIndex = client.initIndex("products");
const usersIndex = client.initIndex("users");
const blogIndex = client.initIndex("blog");

const textSearchController: FirestoreTextSearchController =
    ({ path, searchString }) => {
        if (path === "products")
            return performAlgoliaTextSearch(productsIndex, searchString);
        if (path === "users")
            return performAlgoliaTextSearch(usersIndex, searchString);
        if (path === "blog")
            return performAlgoliaTextSearch(blogIndex, searchString);
        return undefined;
    };

export default function App() {

    const productSchema = buildSchema({
        name: "Product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            }
        }
    });
    const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
        collections: [
            buildCollection({
                path: "products",
                schema: productSchema,
                name: "Products"
            })
        ]
    });

    return <FirebaseCMSApp
        name={"My Online Shop"}
        navigation={navigation}
        textSearchController={textSearchController}
        firebaseConfig={firebaseConfig}
    />;
}

```


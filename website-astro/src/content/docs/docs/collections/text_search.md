---
slug: docs/collections/text_search
title: Text search
description: Add full-text search to FireCMS with Typesense or Algolia. Use our Firebase Extension for typo-tolerant search at ~$7/month, or integrate with Algolia for enterprise needs.
---

:::note[The solution described here is specific for Firestore]
If you are developing your own datasource, you are free to implement text search in
whatever way it makes sense.
:::

Firestore does not support native text search, so we need to rely on external
solutions. If you specify a `textSearchEnabled` flag to the **collection**, you
will see a search bar on top of the collection view.

## Search Options

| Option | Cost | Setup | Best For |
|--------|------|-------|----------|
| **Typesense Extension** (Recommended) | ~$7-14/month flat | 5 min | Most projects |
| **Algolia** | Per-query pricing | 15 min | Enterprise, geo-search |
| **Local Text Search** | Free | 1 min | Small collections (<1000 docs) |

---

## Using Typesense (Recommended)

The **FireCMS Typesense Extension** deploys a Typesense search server on a Compute Engine VM and automatically syncs your Firestore data. Features:

- 🔍 **Typo-tolerant search** - "headphnes" matches "headphones"
- ⚡ **Sub-millisecond responses**
- 💰 **Flat monthly cost** - No per-query charges
- 🔄 **Real-time sync** - Documents auto-index on create/update/delete

### Installation

**Prerequisites:**
- Firebase project with Firestore
- GCP billing enabled
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed

**Step 1: Install the extension**

```bash
firebase ext:install https://github.com/firecmsco/typesense-extension --project=YOUR_PROJECT_ID
```

**Step 2: Grant permissions**

```bash
export PROJECT_ID=your-project-id
export EXT_INSTANCE_ID=typesense-search  # Default extension name

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/compute.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.user" --condition=None
```

**Step 3: Provision the search server**

```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-provisionSearchNode"
```

Replace `REGION` with your functions region (e.g., `us-central1`) and `PROJECT_ID` with your project.

Wait ~2 minutes. Existing documents are automatically indexed.

**Step 4: (Optional) Enable public search access**

```bash
gcloud functions add-iam-policy-binding ext-${EXT_INSTANCE_ID}-api \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker" \
  --region=REGION \
  --project=${PROJECT_ID}
```

### Using Typesense in FireCMS Cloud

Navigate to **Project Settings** and configure:

| Setting | Value |
|---------|-------|
| **Region** | Your extension's region (e.g., `us-central1`) |
| **Extension Instance ID** | Default: `typesense-search` |

That's it! FireCMS Cloud automatically connects to your Typesense instance.

### Using Typesense in Self-Hosted FireCMS

```typescript
import { buildFireCMSSearchController, useFirestoreDelegate } from "@firecms/firebase";

const textSearchControllerBuilder = buildFireCMSSearchController({
  region: "us-central1",  // Your extension's region
  extensionInstanceId: "typesense-search"  // Default name
});

export function App() {
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    textSearchControllerBuilder
  });
  // ... rest of your app
}
```

### Using Typesense Directly (Without FireCMS)

Search via the API proxy endpoint:

```typescript
const response = await fetch(
  "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-api/collections/products/documents/search",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: "blue wireless headphones",
      query_by: "name,description"
    })
  }
);
const results = await response.json();
```

See [Typesense API docs](https://typesense.org/docs/latest/api/) for all available endpoints.

---

## Using Algolia

Algolia is a managed search service with per-query pricing. Best for enterprise needs or advanced features like geo-search.

You need to define a `FirestoreTextSearchControllerBuilder` and add it to your config.
Set up an Algolia account and sync documents using their [Firebase extension](https://extensions.dev/extensions/algolia/firestore-algolia-search).


### Using Algolia in FireCMS Cloud


We provide a utility method for performing searches in Algolia `performAlgoliaTextSearch`.
You need to import the `algoliasearch` library and create an Algolia client.
Then you can use the `performAlgoliaTextSearch` method to perform the search.

In your controller, you can define the paths you want to support and the search.
The paths not specified can still be searched with the local text search.

Example:

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    buildExternalSearchController,
    FirestoreTextSearchController,
    buildCollection,
    FireCMSCloudApp,
    EntityCollectionsBuilder,
    FireCMSAppConfig
} from "@firecms/cloud";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products") {
            return performAlgoliaTextSearch(client, "products", searchString);
        }
        return undefined;
    }
});


const appConfig: FireCMSAppConfig = {
    version: "1",
    textSearchControllerBuilder: algoliaSearchController,
    // ...
}
```

### Using Algolia in self-hosted FireCMS

For self-hosted FireCMS, you need to define a `FirestoreTextSearchControllerBuilder`.

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import { buildExternalSearchController, performAlgoliaTextSearch } from "@firecms/firebase";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products")
            return performAlgoliaTextSearch(client, "products", searchString);
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

However, for larger collections, you will want to use an **external search**
provider, such as Algolia. This is the recommended approach.

You can use local text search in FireCMS Cloud, or in self-hosted versions.

For FireCMS Cloud, you just need to enable it in the UI.

For self-hosted versions, you can enable it by setting the `localTextSearchEnabled` in `useFirestoreDelegate`.
Then you need to mark each collection with `textSearchEnabled: true`.

If you have declared an external indexing provider, the local text search will be
effective **only for the paths not supported by the external provider**.


### Using an external search provider

When using an external search provider, you need to implement a `FirestoreTextSearchController`.

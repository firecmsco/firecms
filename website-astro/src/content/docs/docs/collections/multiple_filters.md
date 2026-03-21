---
slug: docs/collections/multiple_filters
title: Multiple filters in collection views
sidebar_label: Multiple filters
---

Rebase supports filtering and sorting by multiple fields at the same time. Since
Rebase uses **PostgreSQL** as its database, complex queries with multiple filters, 
sorting, and combinations of operators (`>`, `<`, `>=`, `<=`, `=`) work natively without
any additional configuration.

## How it works

Filtering is enabled by default for string, numbers, booleans, dates, and arrays. A dropdown is included in every
column of the collection where applicable.

You can combine any number of filters and sorting criteria simultaneously. Postgres handles
multi-column queries efficiently out of the box.

## Performance optimization with indexes

For large datasets, you may want to create database indexes to optimize specific 
filter/sort combinations. You can define indexes in your collection configuration:

```tsx
import { buildCollection } from "@rebasepro/core";

const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Product",
    properties: {
        // ...
    },
    indexes: [
        {
            category: "asc",
            available: "desc"
        }
    ]
});
```

These indexes will be applied to your Postgres database during schema generation to
ensure optimal query performance.

:::tip
Unlike NoSQL databases, Postgres does not require you to pre-define indexes for 
every filter combination. Queries will work without indexes — indexes just make 
them faster for large datasets.
:::

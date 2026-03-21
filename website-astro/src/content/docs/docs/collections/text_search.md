---
slug: docs/collections/text_search
title: Text search
sidebar_label: Text search
description: Enable text search in your Rebase collections. Postgres full-text search is built in, with optional external providers like Typesense or Algolia for advanced needs.
---

Rebase supports text search out of the box when using PostgreSQL. Since Postgres natively supports
full-text search, you can enable search in your collections without any external services.

## Enabling text search

To enable text search in a collection, set the `textSearchEnabled` property to `true`:

```tsx
const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Products",
    textSearchEnabled: true,
    properties: {
        // ...
    }
});
```

When enabled, a search bar will appear at the top of the collection table, allowing users to search across
text fields in your collection.

## How it works

Rebase leverages PostgreSQL's built-in full-text search capabilities. When a user types a search query,
the backend generates a `tsvector`-based search across the relevant text columns in your table.

This means:
- **No external services required** — search works with just your Postgres database
- **Fast and efficient** — Postgres full-text search is well-optimized
- **Supports partial matching** — finds results even with partial terms

:::tip Performance Tip
For larger datasets, consider adding a GIN index on your searchable text columns to improve search performance:
```sql
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || description));
```
:::

## External search providers (optional)

For advanced search requirements (typo tolerance, faceted search, geo-search), you can integrate
external search providers like Typesense or Algolia.

### Typesense

[Typesense](https://typesense.org/) is an open-source, typo-tolerant search engine that works well with Rebase.

### Algolia

[Algolia](https://www.algolia.com/) provides enterprise-grade search with advanced features like analytics and A/B testing.

To use an external search provider, you need to implement a custom search controller and pass it to
your Rebase configuration.

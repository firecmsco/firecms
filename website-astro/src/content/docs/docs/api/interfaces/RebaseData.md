---
slug: "docs/api/interfaces/RebaseData"
title: "RebaseData"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseData

# Interface: RebaseData

Defined in: [types/src/controllers/data.ts:133](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

The unified data access object.

Access collections as dynamic properties: `data.products.find(...)`.
In the SDK this is backed by HTTP transport (typed, generated per-project).
In the framework this is backed by a Proxy + in-process database driver (dynamic).

## Example

```ts
// SDK
const client = createRebaseClient({ baseUrl: "..." });
await client.data.products.create({ name: "Camera", price: 299 });

// Framework callback
callbacks: {
  afterSave({ context }) {
    await context.data.logs.create({ action: "saved", timestamp: new Date() });
  }
}
```

## Indexable

\[`collectionSlug`: `string`\]: [`CollectionAccessor`](CollectionAccessor)\<`any`\> \| (`slug`) => [`CollectionAccessor`](CollectionAccessor)

Dynamic collection accessor.
Access any collection by its slug as a property.

### Example

```ts
data.products.find({ where: { status: "eq.published" } })
```

## Methods

### collection()

> **collection**(`slug`): [`CollectionAccessor`](CollectionAccessor)

Defined in: [types/src/controllers/data.ts:143](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Get a collection accessor by slug.
Alternative to dynamic property access for cases where
the collection name is a variable.

#### Parameters

##### slug

`string`

#### Returns

[`CollectionAccessor`](CollectionAccessor)

#### Example

```ts
const accessor = data.collection("products");
await accessor.find({ limit: 10 });
```

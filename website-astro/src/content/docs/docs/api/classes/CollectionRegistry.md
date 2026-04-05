---
slug: "docs/api/classes/CollectionRegistry"
title: "CollectionRegistry"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionRegistry

# Class: CollectionRegistry

Defined in: [common/src/collections/CollectionRegistry.ts:15](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

## Constructors

### Constructor

> **new CollectionRegistry**(`collections?`): `CollectionRegistry`

Defined in: [common/src/collections/CollectionRegistry.ts:31](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Parameters

##### collections?

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

#### Returns

`CollectionRegistry`

## Methods

### get()

> **get**(`path`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [common/src/collections/CollectionRegistry.ts:156](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Parameters

##### path

`string`

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

***

### getCollectionByPath()

> **getCollectionByPath**(`collectionPath`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [common/src/collections/CollectionRegistry.ts:179](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

Get collection by resolving multi-segment paths through relations
e.g., "authors/70/posts" resolves to the posts collection

#### Parameters

##### collectionPath

`string`

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

***

### getCollections()

> **getCollections**(): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

Defined in: [common/src/collections/CollectionRegistry.ts:224](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

***

### getRaw()

> **getRaw**(`path`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [common/src/collections/CollectionRegistry.ts:169](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

Gets the pristine, un-normalized collection exactly as it was provided.
Useful for the AST editor so it doesn't accidentally serialize injected metadata back to disk.

#### Parameters

##### path

`string`

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

***

### getRawCollections()

> **getRawCollections**(): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

Defined in: [common/src/collections/CollectionRegistry.ts:228](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

***

### normalizeCollection()

> **normalizeCollection**(`collection`): [`EntityCollection`](../interfaces/EntityCollection)

Defined in: [common/src/collections/CollectionRegistry.ts:111](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Parameters

##### collection

[`EntityCollection`](../interfaces/EntityCollection)

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)

***

### register()

> **register**(`collection`, `rawCollection?`): `void`

Defined in: [common/src/collections/CollectionRegistry.ts:76](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Parameters

##### collection

[`EntityCollection`](../interfaces/EntityCollection)

##### rawCollection?

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>

#### Returns

`void`

***

### registerMultiple()

> **registerMultiple**(`collections`): `boolean`

Defined in: [common/src/collections/CollectionRegistry.ts:55](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

Registers a collection and its subcollections recursively.
Returns true if the collections have changed, false otherwise.

Idempotent: compares the raw input (before normalization) against a stored
snapshot. Only re-normalizes and re-registers when the raw input actually changed.

#### Parameters

##### collections

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

#### Returns

`boolean`

***

### reset()

> **reset**(): `void`

Defined in: [common/src/collections/CollectionRegistry.ts:37](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

#### Returns

`void`

***

### resolvePathToCollections()

> **resolvePathToCollections**(`path`): `object`

Defined in: [common/src/collections/CollectionRegistry.ts:236](https://github.com/rebasepro/rebase/blob/main/packages/common/src/collections/CollectionRegistry.ts)

Resolves a multi-segment path like "products/123/locales" and returns
information about the collections and entity IDs along the path

#### Parameters

##### path

`string`

#### Returns

`object`

##### collections

> **collections**: [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

##### entityIds

> **entityIds**: (`string` \| `number`)[]

##### finalCollection

> **finalCollection**: [`EntityCollection`](../interfaces/EntityCollection)

---
slug: "docs/api/interfaces/CollectionRegistryInterface"
title: "CollectionRegistryInterface"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionRegistryInterface

# Interface: CollectionRegistryInterface

Defined in: [types/src/types/backend.ts:289](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Abstract collection registry interface.
Manages registration and lookup of entity collections.

## Methods

### getCollectionByPath()

> **getCollectionByPath**(`path`): [`EntityCollection`](EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [types/src/types/backend.ts:298](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Get a collection by its path

#### Parameters

##### path

`string`

#### Returns

[`EntityCollection`](EntityCollection)\<`any`, `any`\> \| `undefined`

***

### getCollections()

> **getCollections**(): [`EntityCollection`](EntityCollection)\<`any`, `any`\>[]

Defined in: [types/src/types/backend.ts:303](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Get all registered collections

#### Returns

[`EntityCollection`](EntityCollection)\<`any`, `any`\>[]

***

### register()

> **register**(`collection`): `void`

Defined in: [types/src/types/backend.ts:293](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Register a collection

#### Parameters

##### collection

[`EntityCollection`](EntityCollection)

#### Returns

`void`

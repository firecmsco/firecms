---
slug: "docs/api/type-aliases/CollectionRegistryController"
title: "CollectionRegistryController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionRegistryController

# Type Alias: CollectionRegistryController\<EC\>

> **CollectionRegistryController**\<`EC`\> = `object`

Defined in: [types/src/controllers/navigation.ts:122](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Controller that provides access to the registered entity collections.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

## Properties

### collections?

> `optional` **collections**: [`EntityCollection`](../interfaces/EntityCollection)[]

Defined in: [types/src/controllers/navigation.ts:130](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

List of the mapped collections in the CMS.
Each entry relates to a collection in the root database.
Each of the navigation entries in this field
generates an entry in the main menu.

***

### convertIdsToPaths()

> **convertIdsToPaths**: (`ids`) => `string`[]

Defined in: [types/src/controllers/navigation.ts:168](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Resolve paths from a list of ids

#### Parameters

##### ids

`string`[]

#### Returns

`string`[]

***

### getCollection()

> **getCollection**: (`slugOrPath`, `includeUserOverride?`) => `EC` \| `undefined`

Defined in: [types/src/controllers/navigation.ts:141](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Get the collection configuration for a given path.
The collection is resolved from the given path or alias.

#### Parameters

##### slugOrPath

`string`

##### includeUserOverride?

`boolean`

#### Returns

`EC` \| `undefined`

***

### getParentCollectionIds()

> **getParentCollectionIds**: (`path`) => `string`[]

Defined in: [types/src/controllers/navigation.ts:162](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Retrieve all the related parent collection ids for a given path

#### Parameters

##### path

`string`

#### Returns

`string`[]

***

### getParentReferencesFromPath()

> **getParentReferencesFromPath**: (`path`) => [`EntityReference`](../classes/EntityReference)[]

Defined in: [types/src/controllers/navigation.ts:156](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Retrieve all the related parent references for a given path

#### Parameters

##### path

`string`

#### Returns

[`EntityReference`](../classes/EntityReference)[]

***

### getRawCollection()

> **getRawCollection**: (`slugOrPath`) => `EC` \| `undefined`

Defined in: [types/src/controllers/navigation.ts:148](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Get the raw, un-normalized collection configuration.
This bypasses the `CollectionRegistry` normalization (such as injecting `relation` instances).
This is strictly for the Visual Editor to manipulate AST code without persisting runtime state.

#### Parameters

##### slugOrPath

`string`

#### Returns

`EC` \| `undefined`

***

### initialised

> **initialised**: `boolean`

Defined in: [types/src/controllers/navigation.ts:135](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Is the registry ready to be used

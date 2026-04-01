---
slug: "docs/api/interfaces/CollectionActionsProps"
title: "CollectionActionsProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionActionsProps

# Interface: CollectionActionsProps\<M, USER, EC\>

Defined in: [types/src/types/collections.ts:479](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Parameter passed to the `Actions` prop in the collection configuration.
The component will receive this prop when it is rendered in the collection
toolbar.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### EC

`EC` *extends* [`EntityCollection`](EntityCollection)\<`M`\> = [`EntityCollection`](EntityCollection)\<`M`\>

## Properties

### collection

> **collection**: `EC`

Defined in: [types/src/types/collections.ts:499](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

The collection configuration

***

### collectionEntitiesCount?

> `optional` **collectionEntitiesCount**: `number`

Defined in: [types/src/types/collections.ts:522](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Count of the entities in this collection.
undefined means the count is still loading.

***

### context

> **context**: [`RebaseContext`](../type-aliases/RebaseContext)\<`USER`\>

Defined in: [types/src/types/collections.ts:516](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Context of the app status

***

### parentCollectionIds

> **parentCollectionIds**: `string`[]

Defined in: [types/src/types/collections.ts:494](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Array of the parent path segments like `['users']`

***

### path

> **path**: `string`

Defined in: [types/src/types/collections.ts:484](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Full collection path of this entity. This is the full path, like
`users/1234/addresses`

***

### relativePath

> **relativePath**: `string`

Defined in: [types/src/types/collections.ts:489](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Path of the last collection, like `addresses`

***

### selectionController

> **selectionController**: [`SelectionController`](../type-aliases/SelectionController)\<`M`\>

Defined in: [types/src/types/collections.ts:505](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Use this controller to get the selected entities and to update the
selected entities state.

***

### tableController

> **tableController**: [`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>

Defined in: [types/src/types/collections.ts:511](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Use this controller to get the table controller and to update the
table controller state.

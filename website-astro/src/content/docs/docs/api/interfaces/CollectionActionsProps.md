---
slug: "docs/api/interfaces/CollectionActionsProps"
title: "CollectionActionsProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / CollectionActionsProps

# Interface: CollectionActionsProps\<M, USER, EC\>

Defined in: [types/collections.ts:376](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

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

Defined in: [types/collections.ts:396](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

The collection configuration

***

### collectionEntitiesCount

> **collectionEntitiesCount**: `number`

Defined in: [types/collections.ts:418](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Count of the entities in this collection

***

### context

> **context**: [`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`\>

Defined in: [types/collections.ts:413](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Context of the app status

***

### parentCollectionIds

> **parentCollectionIds**: `string`[]

Defined in: [types/collections.ts:391](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Array of the parent path segments like `['users']`

***

### path

> **path**: `string`

Defined in: [types/collections.ts:381](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Full collection path of this entity. This is the full path, like
`users/1234/addresses`

***

### relativePath

> **relativePath**: `string`

Defined in: [types/collections.ts:386](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Path of the last collection, like `addresses`

***

### selectionController

> **selectionController**: [`SelectionController`](../type-aliases/SelectionController)\<`M`\>

Defined in: [types/collections.ts:402](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use this controller to get the selected entities and to update the
selected entities state.

***

### tableController

> **tableController**: [`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>

Defined in: [types/collections.ts:408](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use this controller to get the table controller and to update the
table controller state.

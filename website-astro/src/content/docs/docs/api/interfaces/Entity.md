---
slug: "docs/api/interfaces/Entity"
title: "Entity"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / Entity

# Interface: Entity\<M\>

Defined in: [types/src/types/entities.ts:11](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Representation of an entity fetched from the driver

## Type Parameters

### M

`M` *extends* `object` = `object`

## Properties

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/types/entities.ts:39](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Which database within the driver (e.g., for Firestore multi-database).
If not specified, the default database of the driver is used.

***

### driver?

> `optional` **driver**: `string`

Defined in: [types/src/types/entities.ts:33](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Which driver this entity belongs to (e.g., 'postgres', 'firestore').
If not specified, the default driver is assumed.

***

### id

> **id**: `string` \| `number`

Defined in: [types/src/types/entities.ts:16](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

ID of the entity

***

### path

> **path**: `string`

Defined in: [types/src/types/entities.ts:22](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

A string representing the path of the referenced document (relative
to the root of the database).

***

### values

> **values**: `M`

Defined in: [types/src/types/entities.ts:27](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Current values

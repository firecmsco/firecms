---
slug: "docs/api/interfaces/EntityReferenceProps"
title: "EntityReferenceProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityReferenceProps

# Interface: EntityReferenceProps

Defined in: [types/src/types/entities.ts:52](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Props for creating an EntityReference

## Properties

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/types/entities.ts:60](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Which database within the driver. Defaults to "(default)"

***

### driver?

> `optional` **driver**: `string`

Defined in: [types/src/types/entities.ts:58](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Which driver (e.g., 'postgres', 'firestore'). Defaults to "(default)"

***

### id

> **id**: `string`

Defined in: [types/src/types/entities.ts:54](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

ID of the entity

***

### path

> **path**: `string`

Defined in: [types/src/types/entities.ts:56](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entities.ts)

Path of the collection (relative to the root of the database)

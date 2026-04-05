---
slug: "docs/api/interfaces/DataTransformer"
title: "DataTransformer"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DataTransformer

# Interface: DataTransformer

Defined in: [types/src/types/backend.ts:314](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Abstract data transformer interface.
Handles serialization/deserialization between frontend and database formats.

## Methods

### deserializeFromDatabase()

> **deserializeFromDatabase**\<`M`\>(`data`, `collection`): `Promise`\<`M`\>

Defined in: [types/src/types/backend.ts:326](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Transform database data back to entity format

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### data

`Record`\<`string`, `any`\>

##### collection

[`EntityCollection`](EntityCollection)

#### Returns

`Promise`\<`M`\>

***

### serializeToDatabase()

> **serializeToDatabase**\<`M`\>(`entity`, `collection`): `Record`\<`string`, `any`\>

Defined in: [types/src/types/backend.ts:318](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Transform entity data for storage in the database

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### entity

`M`

##### collection

[`EntityCollection`](EntityCollection)

#### Returns

`Record`\<`string`, `any`\>

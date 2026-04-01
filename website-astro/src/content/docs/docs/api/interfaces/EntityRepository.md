---
slug: "docs/api/interfaces/EntityRepository"
title: "EntityRepository"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityRepository

# Interface: EntityRepository

Defined in: [types/src/types/backend.ts:147](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Abstract entity repository interface.
Handles all CRUD operations for entities in the database.

Implementations should handle:
- Entity serialization/deserialization
- Relation resolution
- ID generation and conversion

## Methods

### checkUniqueField()

> **checkUniqueField**(`collectionPath`, `fieldName`, `value`, `excludeEntityId?`, `databaseId?`): `Promise`\<`boolean`\>

Defined in: [types/src/types/backend.ts:204](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Check if a field value is unique in a collection

#### Parameters

##### collectionPath

`string`

##### fieldName

`string`

##### value

`unknown`

##### excludeEntityId?

`string`

##### databaseId?

`string`

#### Returns

`Promise`\<`boolean`\>

***

### countEntities()

> **countEntities**\<`M`\>(`collectionPath`, `options?`): `Promise`\<`number`\>

Defined in: [types/src/types/backend.ts:177](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Count entities in a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### collectionPath

`string`

##### options?

[`CountOptions`](CountOptions)\<`M`\>

#### Returns

`Promise`\<`number`\>

***

### deleteEntity()

> **deleteEntity**(`collectionPath`, `entityId`, `databaseId?`): `Promise`\<`void`\>

Defined in: [types/src/types/backend.ts:195](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Delete an entity by ID

#### Parameters

##### collectionPath

`string`

##### entityId

`string` | `number`

##### databaseId?

`string`

#### Returns

`Promise`\<`void`\>

***

### fetchCollection()

> **fetchCollection**\<`M`\>(`collectionPath`, `options?`): `Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Defined in: [types/src/types/backend.ts:160](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Fetch a collection of entities with optional filtering, ordering, and pagination

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### collectionPath

`string`

##### options?

[`FetchCollectionOptions`](FetchCollectionOptions)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>[]\>

***

### fetchEntity()

> **fetchEntity**\<`M`\>(`collectionPath`, `entityId`, `databaseId?`): `Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

Defined in: [types/src/types/backend.ts:151](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Fetch a single entity by ID

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### collectionPath

`string`

##### entityId

`string` | `number`

##### databaseId?

`string`

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

***

### saveEntity()

> **saveEntity**\<`M`\>(`collectionPath`, `values`, `entityId?`, `databaseId?`): `Promise`\<[`Entity`](Entity)\<`M`\>\>

Defined in: [types/src/types/backend.ts:185](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Save an entity (create or update)

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### collectionPath

`string`

##### values

`Partial`\<`M`\>

##### entityId?

`string` | `number`

##### databaseId?

`string`

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

***

### searchEntities()

> **searchEntities**\<`M`\>(`collectionPath`, `searchString`, `options?`): `Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Defined in: [types/src/types/backend.ts:168](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Search entities by text

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### collectionPath

`string`

##### searchString

`string`

##### options?

[`SearchOptions`](SearchOptions)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>[]\>

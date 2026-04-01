---
slug: "docs/api/interfaces/DataSource"
title: "DataSource"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DataSource

# Interface: DataSource

Defined in: [types/src/controllers/datasource.ts:81](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Component in charge of communicating with the data source.

## Properties

### cmsToDelegateModel()?

> `optional` **cmsToDelegateModel**: (`data`) => `unknown`

Defined in: [types/src/controllers/datasource.ts:173](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

#### Parameters

##### data

`unknown`

#### Returns

`unknown`

***

### currentTime()?

> `optional` **currentTime**: () => `unknown`

Defined in: [types/src/controllers/datasource.ts:169](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Get the object to generate the current time in the datasource

#### Returns

`unknown`

***

### delegateToCMSModel()?

> `optional` **delegateToCMSModel**: (`data`) => `unknown`

Defined in: [types/src/controllers/datasource.ts:171](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

#### Parameters

##### data

`unknown`

#### Returns

`unknown`

***

### initialised?

> `optional` **initialised**: `boolean`

Defined in: [types/src/controllers/datasource.ts:91](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

If the data source has been initialised

***

### initTextSearch()?

> `optional` **initTextSearch**: (`props`) => `Promise`\<`boolean`\>

Defined in: [types/src/controllers/datasource.ts:175](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

#### Parameters

##### props

###### collection

[`EntityCollection`](EntityCollection)

###### context

[`RebaseContext`](../type-aliases/RebaseContext)

###### databaseId?

`string`

###### parentCollectionIds?

`string`[]

###### path

`string`

#### Returns

`Promise`\<`boolean`\>

***

### key?

> `optional` **key**: `string`

Defined in: [types/src/controllers/datasource.ts:86](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Key that identifies this data source

***

### needsInitTextSearch?

> `optional` **needsInitTextSearch**: `boolean`

Defined in: [types/src/controllers/datasource.ts:216](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Flag to indicate if the datasource delegate has requested the initialization of the text search index

## Methods

### checkUniqueField()

> **checkUniqueField**(`path`, `name`, `value`, `entityId?`, `collection?`): `Promise`\<`boolean`\>

Defined in: [types/src/controllers/datasource.ts:145](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Check if the given property is unique in the given collection

#### Parameters

##### path

`string`

Collection path

##### name

`string`

of the property

##### value

`unknown`

##### entityId?

`string` | `number`

##### collection?

[`EntityCollection`](EntityCollection)\<`any`, `any`\>

#### Returns

`Promise`\<`boolean`\>

`true` if there are no other fields besides the given entity

***

### countEntities()?

> `optional` **countEntities**\<`M`\>(`props`): `Promise`\<`number`\>

Defined in: [types/src/controllers/datasource.ts:156](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Count the number of entities in a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`FetchCollectionProps`](FetchCollectionProps)\<`M`\>

#### Returns

`Promise`\<`number`\>

***

### deleteEntity()

> **deleteEntity**\<`M`\>(`props`): `Promise`\<`void`\>

Defined in: [types/src/controllers/datasource.ts:134](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Delete an entity

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`DeleteEntityProps`](DeleteEntityProps)\<`M`\>

#### Returns

`Promise`\<`void`\>

was the whole deletion flow successful

***

### executeSql()?

> `optional` **executeSql**(`sql`, `options?`): `Promise`\<`Record`\<`string`, `unknown`\>[]\>

Defined in: [types/src/controllers/datasource.ts:186](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Execute raw SQL (if supported by the datasource)

#### Parameters

##### sql

`string`

##### options?

###### database?

`string`

###### role?

`string`

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>[]\>

***

### fetchAvailableDatabases()?

> `optional` **fetchAvailableDatabases**(): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/datasource.ts:191](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Fetch the available databases (if supported by the datasource)

#### Returns

`Promise`\<`string`[]\>

***

### fetchAvailableRoles()?

> `optional` **fetchAvailableRoles**(): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/datasource.ts:196](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Fetch the available roles (if supported by the datasource)

#### Returns

`Promise`\<`string`[]\>

***

### fetchCollection()

> **fetchCollection**\<`M`\>(`props`): `Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Defined in: [types/src/controllers/datasource.ts:99](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Fetch data from a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`FetchCollectionProps`](FetchCollectionProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Promise of entities

#### See

useCollectionFetch if you need this functionality implemented as a hook

***

### fetchCurrentDatabase()?

> `optional` **fetchCurrentDatabase**(): `Promise`\<`string` \| `undefined`\>

Defined in: [types/src/controllers/datasource.ts:201](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Fetch the current database name (if supported by the datasource)

#### Returns

`Promise`\<`string` \| `undefined`\>

***

### fetchEntity()

> **fetchEntity**\<`M`\>(`props`): `Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

Defined in: [types/src/controllers/datasource.ts:114](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Retrieve an entity given a path and a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`FetchEntityProps`](FetchEntityProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

***

### fetchTableColumns()?

> `optional` **fetchTableColumns**(`tableName`): `Promise`\<[`TableColumnInfo`](TableColumnInfo)[]\>

Defined in: [types/src/controllers/datasource.ts:211](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Fetch column metadata for a given table (if supported)

#### Parameters

##### tableName

`string`

#### Returns

`Promise`\<[`TableColumnInfo`](TableColumnInfo)[]\>

***

### fetchUnmappedTables()?

> `optional` **fetchUnmappedTables**(`mappedPaths?`): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/datasource.ts:206](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Fetch database tables not yet mapped to a collection (if supported)

#### Parameters

##### mappedPaths?

`string`[]

#### Returns

`Promise`\<`string`[]\>

***

### isFilterCombinationValid()?

> `optional` **isFilterCombinationValid**(`props`): `boolean`

Defined in: [types/src/controllers/datasource.ts:162](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Check if the given filter combination is valid

#### Parameters

##### props

`Omit`\<[`FilterCombinationValidProps`](../type-aliases/FilterCombinationValidProps), `"collection"`\> & `object`

#### Returns

`boolean`

***

### listenCollection()?

> `optional` **listenCollection**\<`M`\>(`props`): () => `void`

Defined in: [types/src/controllers/datasource.ts:108](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Listen to a collection in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`ListenCollectionProps`](../type-aliases/ListenCollectionProps)\<`M`\>

#### Returns

Function to cancel subscription

> (): `void`

##### Returns

`void`

#### See

useCollectionFetch if you need this functionality implemented as a hook

***

### listenEntity()?

> `optional` **listenEntity**\<`M`\>(`props`): () => `void`

Defined in: [types/src/controllers/datasource.ts:121](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Get realtime updates on one entity.

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`ListenEntityProps`](../type-aliases/ListenEntityProps)\<`M`\>

#### Returns

Function to cancel subscription

> (): `void`

##### Returns

`void`

***

### saveEntity()

> **saveEntity**\<`M`\>(`props`): `Promise`\<[`Entity`](Entity)\<`M`\>\>

Defined in: [types/src/controllers/datasource.ts:127](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

Save entity to the specified path

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`SaveEntityProps`](SaveEntityProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

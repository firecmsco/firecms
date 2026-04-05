---
slug: "docs/api/interfaces/DataDriver"
title: "DataDriver"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DataDriver

# Interface: DataDriver

Defined in: [types/src/controllers/data\_driver.ts:82](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

**`Internal`**

Internal driver interface for communicating with the data layer.
This is NOT the public API — use `RebaseData` / `context.data` instead.

## Properties

### cmsToDelegateModel()?

> `optional` **cmsToDelegateModel**: (`data`) => `unknown`

Defined in: [types/src/controllers/data\_driver.ts:172](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

#### Parameters

##### data

`unknown`

#### Returns

`unknown`

***

### currentTime()?

> `optional` **currentTime**: () => `unknown`

Defined in: [types/src/controllers/data\_driver.ts:168](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Get the object to generate the current time in the driver

#### Returns

`unknown`

***

### delegateToCMSModel()?

> `optional` **delegateToCMSModel**: (`data`) => `unknown`

Defined in: [types/src/controllers/data\_driver.ts:170](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

#### Parameters

##### data

`unknown`

#### Returns

`unknown`

***

### initialised?

> `optional` **initialised**: `boolean`

Defined in: [types/src/controllers/data\_driver.ts:92](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

If the driver has been initialised

***

### initTextSearch()?

> `optional` **initTextSearch**: (`props`) => `Promise`\<`boolean`\>

Defined in: [types/src/controllers/data\_driver.ts:174](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

Defined in: [types/src/controllers/data\_driver.ts:87](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Key that identifies this driver

***

### needsInitTextSearch?

> `optional` **needsInitTextSearch**: `boolean`

Defined in: [types/src/controllers/data\_driver.ts:215](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Flag to indicate if the driver has requested the initialization of the text search index

## Methods

### checkUniqueField()

> **checkUniqueField**(`path`, `name`, `value`, `entityId?`, `collection?`): `Promise`\<`boolean`\>

Defined in: [types/src/controllers/data\_driver.ts:144](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

Defined in: [types/src/controllers/data\_driver.ts:155](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

Defined in: [types/src/controllers/data\_driver.ts:133](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

Defined in: [types/src/controllers/data\_driver.ts:185](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Execute raw SQL (if supported by the driver)

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

Defined in: [types/src/controllers/data\_driver.ts:190](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Fetch the available databases (if supported by the driver)

#### Returns

`Promise`\<`string`[]\>

***

### fetchAvailableRoles()?

> `optional` **fetchAvailableRoles**(): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/data\_driver.ts:195](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Fetch the available roles (if supported by the driver)

#### Returns

`Promise`\<`string`[]\>

***

### fetchCollection()

> **fetchCollection**\<`M`\>(`props`): `Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Defined in: [types/src/controllers/data\_driver.ts:99](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

***

### fetchCurrentDatabase()?

> `optional` **fetchCurrentDatabase**(): `Promise`\<`string` \| `undefined`\>

Defined in: [types/src/controllers/data\_driver.ts:200](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Fetch the current database name (if supported by the driver)

#### Returns

`Promise`\<`string` \| `undefined`\>

***

### fetchEntity()

> **fetchEntity**\<`M`\>(`props`): `Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

Defined in: [types/src/controllers/data\_driver.ts:113](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

Defined in: [types/src/controllers/data\_driver.ts:210](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Fetch column metadata for a given table (if supported)

#### Parameters

##### tableName

`string`

#### Returns

`Promise`\<[`TableColumnInfo`](TableColumnInfo)[]\>

***

### fetchUnmappedTables()?

> `optional` **fetchUnmappedTables**(`mappedPaths?`): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/data\_driver.ts:205](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Fetch database tables not yet mapped to a collection (if supported)

#### Parameters

##### mappedPaths?

`string`[]

#### Returns

`Promise`\<`string`[]\>

***

### isFilterCombinationValid()?

> `optional` **isFilterCombinationValid**(`props`): `boolean`

Defined in: [types/src/controllers/data\_driver.ts:161](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Check if the given filter combination is valid

#### Parameters

##### props

`Omit`\<[`FilterCombinationValidProps`](../type-aliases/FilterCombinationValidProps), `"collection"`\> & `object`

#### Returns

`boolean`

***

### listenCollection()?

> `optional` **listenCollection**\<`M`\>(`props`): () => `void`

Defined in: [types/src/controllers/data\_driver.ts:107](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

***

### listenEntity()?

> `optional` **listenEntity**\<`M`\>(`props`): () => `void`

Defined in: [types/src/controllers/data\_driver.ts:120](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

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

Defined in: [types/src/controllers/data\_driver.ts:126](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

Save entity to the specified path

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`SaveEntityProps`](SaveEntityProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

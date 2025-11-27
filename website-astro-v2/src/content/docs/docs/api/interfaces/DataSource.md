---
slug: "docs/api/interfaces/DataSource"
title: "DataSource"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DataSource

# Interface: DataSource

Defined in: [types/datasource.ts:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Component in charge of communicating with the data source.
Usually you won't need to implement this interface, but a [DataSourceDelegate](DataSourceDelegate) instead.

## Properties

### initTextSearch()?

> `optional` **initTextSearch**: (`props`) => `Promise`\<`boolean`\>

Defined in: [types/datasource.ts:230](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Called when the user clicks on the search bar in a collection view.
Useful for initializing a text search index.

#### Parameters

##### props

###### collection

[`EntityCollection`](EntityCollection)

###### context

[`FireCMSContext`](../type-aliases/FireCMSContext)

###### parentCollectionIds?

`string`[]

###### path

`string`

#### Returns

`Promise`\<`boolean`\>

## Methods

### checkUniqueField()

> **checkUniqueField**(`path`, `name`, `value`, `entityId?`, `collection?`): `Promise`\<`boolean`\>

Defined in: [types/datasource.ts:201](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Check if the given property is unique in the given collection

#### Parameters

##### path

`string`

Collection path

##### name

`string`

of the property

##### value

`any`

##### entityId?

`string`

##### collection?

[`EntityCollection`](EntityCollection)\<`any`, `any`\>

#### Returns

`Promise`\<`boolean`\>

`true` if there are no other fields besides the given entity

***

### countEntities()?

> `optional` **countEntities**\<`M`\>(`props`): `Promise`\<`number`\>

Defined in: [types/datasource.ts:217](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

> **deleteEntity**\<`M`\>(`entity`): `Promise`\<`void`\>

Defined in: [types/datasource.ts:185](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Delete an entity

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### entity

[`DeleteEntityProps`](DeleteEntityProps)\<`M`\>

#### Returns

`Promise`\<`void`\>

was the whole deletion flow successful

***

### fetchCollection()

> **fetchCollection**\<`M`\>(`path`): `Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Defined in: [types/datasource.ts:90](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Fetch data from a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`FetchCollectionProps`](FetchCollectionProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Function to cancel subscription

#### See

useCollectionFetch if you need this functionality implemented as a hook

***

### fetchEntity()

> **fetchEntity**\<`M`\>(`path`): `Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

Defined in: [types/datasource.ts:139](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Retrieve an entity given a path and a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`FetchEntityProps`](FetchEntityProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

***

### generateEntityId()

> **generateEntityId**(`path`, `collection`): `string`

Defined in: [types/datasource.ts:212](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Generate an id for a new entity

#### Parameters

##### path

`string`

##### collection

[`EntityCollection`](EntityCollection)

#### Returns

`string`

***

### isFilterCombinationValid()?

> `optional` **isFilterCombinationValid**(`props`): `boolean`

Defined in: [types/datasource.ts:223](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Check if the given filter combination is valid

#### Parameters

##### props

[`FilterCombinationValidProps`](../type-aliases/FilterCombinationValidProps)

#### Returns

`boolean`

***

### listenCollection()?

> `optional` **listenCollection**\<`M`\>(`path`): () => `void`

Defined in: [types/datasource.ts:118](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Listen to a collection in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

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

> `optional` **listenEntity**\<`M`\>(`path`): () => `void`

Defined in: [types/datasource.ts:156](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Get realtime updates on one entity.

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`ListenEntityProps`](../type-aliases/ListenEntityProps)\<`M`\>

#### Returns

Function to cancel subscription

> (): `void`

##### Returns

`void`

***

### saveEntity()

> **saveEntity**\<`M`\>(`path`): `Promise`\<[`Entity`](Entity)\<`M`\>\>

Defined in: [types/datasource.ts:171](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Save entity to the specified path

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`SaveEntityProps`](SaveEntityProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

---
slug: "docs/api/interfaces/DataSourceDelegate"
title: "DataSourceDelegate"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DataSourceDelegate

# Interface: DataSourceDelegate

Defined in: [types/datasource.ts:252](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

## Properties

### cmsToDelegateModel()

> **cmsToDelegateModel**: (`data`) => `any`

Defined in: [types/datasource.ts:396](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

#### Parameters

##### data

`any`

#### Returns

`any`

***

### currentTime()?

> `optional` **currentTime**: () => `any`

Defined in: [types/datasource.ts:392](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Get the object to generate the current time in the datasource

#### Returns

`any`

***

### delegateToCMSModel()

> **delegateToCMSModel**: (`data`) => `any`

Defined in: [types/datasource.ts:394](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

#### Parameters

##### data

`any`

#### Returns

`any`

***

### initialised?

> `optional` **initialised**: `boolean`

Defined in: [types/datasource.ts:262](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

If the data source has been initialised

***

### initTextSearch()?

> `optional` **initTextSearch**: (`props`) => `Promise`\<`boolean`\>

Defined in: [types/datasource.ts:400](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

#### Parameters

##### props

###### collection

[`EntityCollection`](EntityCollection)

###### context

[`FireCMSContext`](../type-aliases/FireCMSContext)

###### databaseId?

`string`

###### parentCollectionIds?

`string`[]

###### path

`string`

#### Returns

`Promise`\<`boolean`\>

***

### key

> **key**: `string`

Defined in: [types/datasource.ts:257](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Key that identifies this data source delegate

***


#### Parameters

##### input?

`any`

#### Returns

`any`

## Methods

### checkUniqueField()

> **checkUniqueField**(`path`, `name`, `value`, `entityId?`, `collection?`): `Promise`\<`boolean`\>

Defined in: [types/datasource.ts:369](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

Defined in: [types/datasource.ts:379](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Count the number of entities in a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`FetchCollectionDelegateProps`](../type-aliases/FetchCollectionDelegateProps)\<`M`\>

#### Returns

`Promise`\<`number`\>

***

### deleteEntity()

> **deleteEntity**\<`M`\>(`entity`): `Promise`\<`void`\>

Defined in: [types/datasource.ts:358](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

Defined in: [types/datasource.ts:276](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Fetch data from a collection

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`FetchCollectionDelegateProps`](../type-aliases/FetchCollectionDelegateProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>[]\>

Function to cancel subscription

#### See

useCollectionFetch if you need this functionality implemented as a hook

***

### fetchEntity()

> **fetchEntity**\<`M`\>(`path`): `Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

Defined in: [types/datasource.ts:318](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

> **generateEntityId**(`path`, `collection?`): `string`

Defined in: [types/datasource.ts:374](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Generate an id for a new entity

#### Parameters

##### path

`string`

##### collection?

[`EntityCollection`](EntityCollection)\<`any`, `any`\>

#### Returns

`string`

***

### isFilterCombinationValid()?

> `optional` **isFilterCombinationValid**(`props`): `boolean`

Defined in: [types/datasource.ts:385](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Check if the given filter combination is valid

#### Parameters

##### props

`Omit`\<[`FilterCombinationValidProps`](../type-aliases/FilterCombinationValidProps), `"collection"`\> & `object`

#### Returns

`boolean`

***

### listenCollection()?

> `optional` **listenCollection**\<`M`\>(`path`): () => `void`

Defined in: [types/datasource.ts:301](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Listen to a collection in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`ListenCollectionDelegateProps`](../type-aliases/ListenCollectionDelegateProps)\<`M`\>

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

Defined in: [types/datasource.ts:332](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

Defined in: [types/datasource.ts:346](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

Save entity to the specified path

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

[`SaveEntityDelegateProps`](../type-aliases/SaveEntityDelegateProps)\<`M`\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

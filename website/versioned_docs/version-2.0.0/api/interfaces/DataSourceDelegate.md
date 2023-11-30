---
id: "DataSourceDelegate"
title: "Interface: DataSourceDelegate"
sidebar_label: "DataSourceDelegate"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### buildDate

• **buildDate**: (`date`: `Date`) => `any`

#### Type declaration

▸ (`date`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `Date` |

##### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:382](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L382)

___

### buildDeleteFieldValue

• **buildDeleteFieldValue**: () => `any`

#### Type declaration

▸ (): `any`

##### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:384](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L384)

___

### buildGeoPoint

• **buildGeoPoint**: (`geoPoint`: [`GeoPoint`](../classes/GeoPoint.md)) => `any`

#### Type declaration

▸ (`geoPoint`): `any`

Convert a FireCMS GeoPoint to a GeoPoint that can be used by the datasource

##### Parameters

| Name | Type |
| :------ | :------ |
| `geoPoint` | [`GeoPoint`](../classes/GeoPoint.md) |

##### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:375](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L375)

___

### buildReference

• **buildReference**: (`reference`: [`EntityReference`](../classes/EntityReference.md)) => `any`

#### Type declaration

▸ (`reference`): `any`

Convert a FireCMS reference to a reference that can be used by the datasource

##### Parameters

| Name | Type |
| :------ | :------ |
| `reference` | [`EntityReference`](../classes/EntityReference.md) |

##### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:369](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L369)

___

### delegateToCMSModel

• **delegateToCMSModel**: (`data`: `any`) => `any`

#### Type declaration

▸ (`data`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

##### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:386](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L386)

___

### setDateToMidnight

• **setDateToMidnight**: (`input?`: `any`) => `any`

#### Type declaration

▸ (`input?`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `input?` | `any` |

##### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:388](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L388)

## Methods

### checkUniqueField

▸ **checkUniqueField**(`path`, `name`, `value`, `entityId?`): `Promise`\<`boolean`\>

Check if the given property is unique in the given collection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | Collection path |
| `name` | `string` | of the property |
| `value` | `any` |  |
| `entityId?` | `string` |  |

#### Returns

`Promise`\<`boolean`\>

`true` if there are no other fields besides the given entity

#### Defined in

[packages/firecms_core/src/types/datasource.ts:347](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L347)

___

### countEntities

▸ **countEntities**\<`M`\>(`props`): `Promise`\<`number`\>

Count the number of entities in a collection

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`FetchCollectionDelegateProps`](../types/FetchCollectionDelegateProps.md)\<`M`\> |

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:357](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L357)

___

### currentTime

▸ **currentTime**(): `any`

Get the object to generate the current time in the datasource

#### Returns

`any`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:380](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L380)

___

### deleteEntity

▸ **deleteEntity**\<`M`\>(`entity`): `Promise`\<`void`\>

Delete an entity

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`DeleteEntityProps`](DeleteEntityProps.md)\<`M`\> |

#### Returns

`Promise`\<`void`\>

was the whole deletion flow successful

#### Defined in

[packages/firecms_core/src/types/datasource.ts:337](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L337)

___

### fetchCollection

▸ **fetchCollection**\<`M`\>(`«destructured»`): `Promise`\<[`Entity`](Entity.md)\<`M`\>[]\>

Fetch data from a collection

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`FetchCollectionDelegateProps`](../types/FetchCollectionDelegateProps.md)\<`M`\> |

#### Returns

`Promise`\<[`Entity`](Entity.md)\<`M`\>[]\>

Function to cancel subscription

**`See`**

useCollectionFetch if you need this functionality implemented as a hook

#### Defined in

[packages/firecms_core/src/types/datasource.ts:255](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L255)

___

### fetchEntity

▸ **fetchEntity**\<`M`\>(`«destructured»`): `Promise`\<`undefined` \| [`Entity`](Entity.md)\<`M`\>\>

Retrieve an entity given a path and a collection

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Omit`\<[`FetchEntityProps`](FetchEntityProps.md)\<`M`\>, ``"collection"``\> |

#### Returns

`Promise`\<`undefined` \| [`Entity`](Entity.md)\<`M`\>\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:297](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L297)

___

### generateEntityId

▸ **generateEntityId**(`path`): `string`

Generate an id for a new entity

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`string`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:352](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L352)

___

### isFilterCombinationValid

▸ **isFilterCombinationValid**(`props`): `boolean`

Check if the given filter combination is valid

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Omit`\<[`FilterCombinationValidProps`](../types/FilterCombinationValidProps.md), ``"collection"``\> |

#### Returns

`boolean`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:363](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L363)

___

### listenCollection

▸ **listenCollection**\<`M`\>(`«destructured»`): () => `void`

Listen to a collection in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ListenCollectionDelegateProps`](../types/ListenCollectionDelegateProps.md)\<`M`\> |

#### Returns

`fn`

Function to cancel subscription

▸ (): `void`

Listen to a collection in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

##### Returns

`void`

Function to cancel subscription

**`See`**

useCollectionFetch if you need this functionality implemented as a hook

**`See`**

useCollectionFetch if you need this functionality implemented as a hook

#### Defined in

[packages/firecms_core/src/types/datasource.ts:280](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L280)

___

### listenEntity

▸ **listenEntity**\<`M`\>(`«destructured»`): () => `void`

Get realtime updates on one entity.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Omit`\<[`ListenEntityProps`](../types/ListenEntityProps.md)\<`M`\>, ``"collection"``\> |

#### Returns

`fn`

Function to cancel subscription

▸ (): `void`

Get realtime updates on one entity.

##### Returns

`void`

Function to cancel subscription

#### Defined in

[packages/firecms_core/src/types/datasource.ts:311](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L311)

___

### saveEntity

▸ **saveEntity**\<`M`\>(`«destructured»`): `Promise`\<[`Entity`](Entity.md)\<`M`\>\>

Save entity to the specified path

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SaveEntityDelegateProps`](../types/SaveEntityDelegateProps.md)\<`M`\> |

#### Returns

`Promise`\<[`Entity`](Entity.md)\<`M`\>\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:325](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L325)

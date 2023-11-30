---
id: "DataSource"
title: "Interface: DataSource"
sidebar_label: "DataSource"
sidebar_position: 0
custom_edit_url: null
---

Implement this interface and pass it to a [FireCMS](../functions/FireCMS.md)
to connect it to your data source.
A Firestore implementation of this interface can be found in useFirestoreDataSource

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

[packages/firecms_core/src/types/datasource.ts:197](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L197)

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
| `props` | [`FetchCollectionProps`](FetchCollectionProps.md)\<`M`\> |

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:212](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L212)

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

[packages/firecms_core/src/types/datasource.ts:182](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L182)

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
| `«destructured»` | [`FetchCollectionProps`](FetchCollectionProps.md)\<`M`\> |

#### Returns

`Promise`\<[`Entity`](Entity.md)\<`M`\>[]\>

Function to cancel subscription

**`See`**

useCollectionFetch if you need this functionality implemented as a hook

#### Defined in

[packages/firecms_core/src/types/datasource.ts:88](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L88)

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
| `«destructured»` | [`FetchEntityProps`](FetchEntityProps.md)\<`M`\> |

#### Returns

`Promise`\<`undefined` \| [`Entity`](Entity.md)\<`M`\>\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:137](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L137)

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

[packages/firecms_core/src/types/datasource.ts:207](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L207)

___

### isFilterCombinationValid

▸ **isFilterCombinationValid**(`props`): `boolean`

Check if the given filter combination is valid

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`FilterCombinationValidProps`](../types/FilterCombinationValidProps.md) |

#### Returns

`boolean`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:218](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L218)

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
| `«destructured»` | [`ListenCollectionProps`](../types/ListenCollectionProps.md)\<`M`\> |

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

[packages/firecms_core/src/types/datasource.ts:116](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L116)

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
| `«destructured»` | [`ListenEntityProps`](../types/ListenEntityProps.md)\<`M`\> |

#### Returns

`fn`

Function to cancel subscription

▸ (): `void`

Get realtime updates on one entity.

##### Returns

`void`

Function to cancel subscription

#### Defined in

[packages/firecms_core/src/types/datasource.ts:153](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L153)

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
| `«destructured»` | [`SaveEntityProps`](SaveEntityProps.md)\<`M`\> |

#### Returns

`Promise`\<[`Entity`](Entity.md)\<`M`\>\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:168](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L168)

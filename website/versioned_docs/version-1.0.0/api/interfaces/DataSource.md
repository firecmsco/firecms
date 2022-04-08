---
id: "DataSource"
title: "Interface: DataSource"
sidebar_label: "DataSource"
sidebar_position: 0
custom_edit_url: null
---

Implement this interface and pass it to a [FireCMS](../functions/FireCMS)
to connect it to your data source.
A Firestore implementation of this interface can be found in [useFirestoreDataSource](../functions/useFirestoreDataSource)

## Methods

### checkUniqueField

▸ **checkUniqueField**(`path`, `name`, `value`, `property`, `entityId?`): `Promise`<`boolean`\>

Check if the given property is unique in the given collection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | Collection path |
| `name` | `string` | of the property |
| `value` | `any` |  |
| `property` | [`StringProperty`](StringProperty) \| [`NumberProperty`](NumberProperty) \| [`BooleanProperty`](BooleanProperty) \| [`TimestampProperty`](TimestampProperty) \| [`GeopointProperty`](GeopointProperty) \| [`ReferenceProperty`](ReferenceProperty)<`any`\> \| [`MapProperty`](MapProperty)<{ `[Key: string]`: `any`;  }\> \| [`ArrayProperty`](ArrayProperty)<[`CMSType`](../types/CMSType)[], `any`\> |  |
| `entityId?` | `string` |  |

#### Returns

`Promise`<`boolean`\>

`true` if there are no other fields besides the given entity

#### Defined in

[models/datasource.ts:202](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L202)

___

### deleteEntity

▸ **deleteEntity**<`M`\>(`__namedParameters`): `Promise`<`void`\>

Delete an entity

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`DeleteEntityProps`](DeleteEntityProps)<`M`\> |

#### Returns

`Promise`<`void`\>

was the whole deletion flow successful

#### Defined in

[models/datasource.ts:187](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L187)

___

### fetchCollection

▸ **fetchCollection**<`M`\>(`__namedParameters`): `Promise`<[`Entity`](Entity)<`M`\>[]\>

Fetch data from a collection

**`see`** useCollectionFetch if you need this functionality implemented as a hook

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`FetchCollectionProps`](FetchCollectionProps)<`M`\> |

#### Returns

`Promise`<[`Entity`](Entity)<`M`\>[]\>

Function to cancel subscription

#### Defined in

[models/datasource.ts:92](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L92)

___

### fetchEntity

▸ **fetchEntity**<`M`\>(`__namedParameters`): `Promise`<[`Entity`](Entity)<`M`\>\>

Retrieve an entity given a path and a schema

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`FetchEntityProps`](FetchEntityProps)<`M`\> |

#### Returns

`Promise`<[`Entity`](Entity)<`M`\>\>

#### Defined in

[models/datasource.ts:141](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L141)

___

### listenCollection

▸ `Optional` **listenCollection**<`M`\>(`__namedParameters`): () => `void`

Listen to a entities in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

**`see`** useCollectionFetch if you need this functionality implemented as a hook

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`ListenCollectionProps`](../types/ListenCollectionProps)<`M`\> |

#### Returns

`fn`

Function to cancel subscription

▸ (): `void`

Listen to a entities in a given path. If you don't implement this method
`fetchCollection` will be used instead, with no real time updates.

**`see`** useCollectionFetch if you need this functionality implemented as a hook

##### Returns

`void`

Function to cancel subscription

#### Defined in

[models/datasource.ts:120](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L120)

___

### listenEntity

▸ `Optional` **listenEntity**<`M`\>(`__namedParameters`): () => `void`

Get realtime updates on one entity.

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`ListenEntityProps`](../types/ListenEntityProps)<`M`\> |

#### Returns

`fn`

Function to cancel subscription

▸ (): `void`

Get realtime updates on one entity.

##### Returns

`void`

Function to cancel subscription

#### Defined in

[models/datasource.ts:157](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L157)

___

### saveEntity

▸ **saveEntity**<`M`\>(`__namedParameters`): `Promise`<[`Entity`](Entity)<`M`\>\>

Save entity to the specified path

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`SaveEntityProps`](SaveEntityProps)<`M`\> |

#### Returns

`Promise`<[`Entity`](Entity)<`M`\>\>

#### Defined in

[models/datasource.ts:172](https://github.com/Camberi/firecms/blob/2d60fba/src/models/datasource.ts#L172)

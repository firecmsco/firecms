---
id: "EntityCallbacks"
title: "Interface: EntityCallbacks<M, UserType>"
sidebar_label: "EntityCallbacks"
sidebar_position: 0
custom_edit_url: null
---

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Methods

### onDelete

▸ **onDelete**(`entityDeleteProps`): `void`

Callback used after the entity is deleted.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [`EntityOnDeleteProps`](EntityOnDeleteProps.md)\<`M`, `UserType`\> |

#### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:59](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L59)

___

### onFetch

▸ **onFetch**(`entityFetchProps`): [`Entity`](Entity.md)\<`M`\> \| `Promise`\<[`Entity`](Entity.md)\<`M`\>\>

Callback used after fetching data

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityFetchProps` | [`EntityOnFetchProps`](EntityOnFetchProps.md)\<`M`, `UserType`\> |

#### Returns

[`Entity`](Entity.md)\<`M`\> \| `Promise`\<[`Entity`](Entity.md)\<`M`\>\>

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:19](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L19)

___

### onIdUpdate

▸ **onIdUpdate**(`idUpdateProps`): `string`

Callback fired when any value in the form changes. You can use it
to define the ID of a `new` entity based on the current values.
The returned string will be used as the ID of the entity.

#### Parameters

| Name | Type |
| :------ | :------ |
| `idUpdateProps` | [`EntityIdUpdateProps`](EntityIdUpdateProps.md)\<`M`\> |

#### Returns

`string`

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:68](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L68)

___

### onPreDelete

▸ **onPreDelete**(`entityDeleteProps`): `void`

Callback used after the entity is deleted.
If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [`EntityOnDeleteProps`](EntityOnDeleteProps.md)\<`M`, `UserType`\> |

#### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:52](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L52)

___

### onPreSave

▸ **onPreSave**(`entitySaveProps`): `Partial`\<`M`\> \| `Promise`\<`Partial`\<`M`\>\>

Callback used before saving, you need to return the values that will get
saved. If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [`EntityOnSaveProps`](EntityOnSaveProps.md)\<`M`, `UserType`\> |

#### Returns

`Partial`\<`M`\> \| `Promise`\<`Partial`\<`M`\>\>

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:42](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L42)

___

### onSaveFailure

▸ **onSaveFailure**(`entitySaveProps`): `void` \| `Promise`\<`void`\>

Callback used when saving fails

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [`EntityOnSaveProps`](EntityOnSaveProps.md)\<`M`, `UserType`\> |

#### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:33](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L33)

___

### onSaveSuccess

▸ **onSaveSuccess**(`entitySaveProps`): `void` \| `Promise`\<`void`\>

Callback used when save is successful

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [`EntityOnSaveProps`](EntityOnSaveProps.md)\<`M`, `UserType`\> |

#### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:26](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L26)

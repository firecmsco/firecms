---
id: "EntityCallbacks"
title: "Interface: EntityCallbacks<M>"
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
| `M` | extends `Object` = `any` |

## Methods

### onDelete

▸ `Optional` **onDelete**(`entityDeleteProps`): `void`

Callback used after the entity is deleted.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [`EntityOnDeleteProps`](EntityOnDeleteProps)<`M`\> |

#### Returns

`void`

#### Defined in

[models/entity_callbacks.ts:54](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L54)

___

### onPreDelete

▸ `Optional` **onPreDelete**(`entityDeleteProps`): `void`

Callback used after the entity is deleted.
If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [`EntityOnDeleteProps`](EntityOnDeleteProps)<`M`\> |

#### Returns

`void`

#### Defined in

[models/entity_callbacks.ts:47](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L47)

___

### onPreSave

▸ `Optional` **onPreSave**(`entitySaveProps`): `Partial`<`M`\> \| `Promise`<`Partial`<`M`\>\>

Callback used before saving, you need to return the values that will get
saved. If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [`EntityOnSaveProps`](EntityOnSaveProps)<`M`\> |

#### Returns

`Partial`<`M`\> \| `Promise`<`Partial`<`M`\>\>

#### Defined in

[models/entity_callbacks.ts:37](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L37)

___

### onSaveFailure

▸ `Optional` **onSaveFailure**(`entitySaveProps`): `void` \| `Promise`<`void`\>

Callback used when saving fails

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [`EntityOnSaveProps`](EntityOnSaveProps)<`M`\> |

#### Returns

`void` \| `Promise`<`void`\>

#### Defined in

[models/entity_callbacks.ts:28](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L28)

___

### onSaveSuccess

▸ `Optional` **onSaveSuccess**(`entitySaveProps`): `void` \| `Promise`<`void`\>

Callback used when save is successful

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [`EntityOnSaveProps`](EntityOnSaveProps)<`M`\> |

#### Returns

`void` \| `Promise`<`void`\>

#### Defined in

[models/entity_callbacks.ts:21](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L21)

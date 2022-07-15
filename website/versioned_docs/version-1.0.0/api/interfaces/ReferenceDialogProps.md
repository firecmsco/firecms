---
id: "ReferenceDialogProps"
title: "Interface: ReferenceDialogProps"
sidebar_label: "ReferenceDialogProps"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### collectionResolver

• **collectionResolver**: [`EntityCollectionResolver`](../types/EntityCollectionResolver)<`any`\>

Entity collection config

#### Defined in

[core/components/ReferenceDialog.tsx:47](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L47)

___

### multiselect

• **multiselect**: `boolean`

Allow multiple selection of values

#### Defined in

[core/components/ReferenceDialog.tsx:42](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L42)

___

### open

• **open**: `boolean`

Is the dialog currently open

#### Defined in

[core/components/ReferenceDialog.tsx:37](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L37)

___

### path

• **path**: `string`

Absolute path of the collection

#### Defined in

[core/components/ReferenceDialog.tsx:52](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L52)

___

### selectedEntityIds

• `Optional` **selectedEntityIds**: `string`[]

If you are opening the dialog for the first time, you can select some
entity ids to be displayed first.

#### Defined in

[core/components/ReferenceDialog.tsx:58](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L58)

## Methods

### onClose

▸ **onClose**(): `void`

Is the dialog currently open

#### Returns

`void`

#### Defined in

[core/components/ReferenceDialog.tsx:80](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L80)

___

### onMultipleEntitiesSelected

▸ `Optional` **onMultipleEntitiesSelected**(`entities`): `void`

If `multiselect` is set to `true`, you will get the selected entities
in this callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entities` | [`Entity`](Entity)<`any`\>[] |

#### Returns

`void`

#### Defined in

[core/components/ReferenceDialog.tsx:74](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L74)

___

### onSingleEntitySelected

▸ `Optional` **onSingleEntitySelected**(`entity`): `void`

If `multiselect` is set to `false`, you will get the select entity
in this callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | ``null`` \| [`Entity`](Entity)<`any`\> |

#### Returns

`void`

#### Defined in

[core/components/ReferenceDialog.tsx:66](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/ReferenceDialog.tsx#L66)

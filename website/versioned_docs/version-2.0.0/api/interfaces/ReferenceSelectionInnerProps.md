---
id: "ReferenceSelectionInnerProps"
title: "Interface: ReferenceSelectionInnerProps<M>"
sidebar_label: "ReferenceSelectionInnerProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

## Properties

### collection

• `Optional` **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>

Entity collection config

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:36](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L36)

___

### description

• `Optional` **description**: `ReactNode`

Use this description to indicate the user what to do in this dialog.

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:75](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L75)

___

### forceFilter

• `Optional` **forceFilter**: `Partial`\<`Record`\<`string`, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

Allow selection of entities that pass the given filter only.

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:70](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L70)

___

### maxSelection

• `Optional` **maxSelection**: `number`

Maximum number of entities that can be selected.

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:80](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L80)

___

### multiselect

• `Optional` **multiselect**: `boolean`

Allow multiple selection of values

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:31](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L31)

___

### path

• **path**: `string`

Absolute path of the collection.
May be not set if this hook is being used in a component and the path is
dynamic. If not set, the dialog won't open.

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:43](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L43)

___

### selectedEntityIds

• `Optional` **selectedEntityIds**: `string`[]

If you are opening the dialog for the first time, you can select some
entity ids to be displayed first.

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:49](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L49)

## Methods

### onMultipleEntitiesSelected

▸ **onMultipleEntitiesSelected**(`entities`): `void`

If `multiselect` is set to `true`, you will get the selected entities
in this callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entities` | [`Entity`](Entity.md)\<`any`\>[] |

#### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:65](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L65)

___

### onSingleEntitySelected

▸ **onSingleEntitySelected**(`entity`): `void`

If `multiselect` is set to `false`, you will get the selected entity
in this callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | ``null`` \| [`Entity`](Entity.md)\<`any`\> |

#### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx:57](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ReferenceSelectionInner.tsx#L57)

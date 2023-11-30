---
id: "EntitySidePanelProps"
title: "Interface: EntitySidePanelProps<M>"
sidebar_label: "EntitySidePanelProps"
sidebar_position: 0
custom_edit_url: null
---

Props used to open a side dialog

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### closeOnSave

• `Optional` **closeOnSave**: `boolean`

Should this panel close when saving

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:66](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L66)

___

### collection

• `Optional` **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\> \| [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

Collection representing the entities of this view.
If you leave it blank it will be induced by your navigation

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:42](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L42)

___

### copy

• `Optional` **copy**: `boolean`

Set this flag to true if you want to make a copy of an existing entity

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:24](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L24)

___

### entityId

• `Optional` **entityId**: `string`

ID of the entity, if not set, it means we are creating a new entity

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:19](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L19)

___

### onClose

• `Optional` **onClose**: () => `void`

#### Type declaration

▸ (): `void`

Callback when the dialog is closed

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:61](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L61)

___

### onUpdate

• `Optional` **onUpdate**: (`params`: \{ `entity`: [`Entity`](Entity.md)\<`any`\>  }) => `void`

#### Type declaration

▸ (`params`): `void`

Callback when the entity is updated

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.entity` | [`Entity`](Entity.md)\<`any`\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:56](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L56)

___

### path

• **path**: `string`

Absolute path of the entity

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:14](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L14)

___

### selectedSubPath

• `Optional` **selectedSubPath**: `string`

Open the entity with a selected sub-collection view. If the panel for this
entity was already open, it is replaced.

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:30](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L30)

___

### updateUrl

• `Optional` **updateUrl**: `boolean`

Should update the URL when opening the dialog.
Consider that if the collection that you provide is not defined in the base
config of your `FireCMS` component, you will not be able to recreate
the state if copying the URL to a different window.

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:50](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L50)

___

### width

• `Optional` **width**: `string` \| `number`

Use this prop to override the width of the form view.
e.g. "600px"

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:36](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L36)

---
id: "EntityOnSaveProps"
title: "Interface: EntityOnSaveProps<M, UserType>"
sidebar_label: "EntityOnSaveProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is saved

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Properties

### collection

• **collection**: [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

Resolved collection of the entity

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:108](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L108)

___

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\>

Context of the app status

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:144](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L144)

___

### entityId

• `Optional` **entityId**: `string`

ID of the entity

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:124](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L124)

___

### path

• **path**: `string`

Full path of the CMS where this entity is being saved.
Might contain unresolved aliases.

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:114](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L114)

___

### previousValues

• `Optional` **previousValues**: `Partial`\<`M`\>

Previous values

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:134](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L134)

___

### resolvedPath

• **resolvedPath**: `string`

Full path where this entity is being saved, with alias resolved

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:119](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L119)

___

### status

• **status**: [`EntityStatus`](../types/EntityStatus.md)

New or existing entity

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:139](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L139)

___

### values

• **values**: `Partial`\<`M`\>

Values being saved

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:129](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L129)

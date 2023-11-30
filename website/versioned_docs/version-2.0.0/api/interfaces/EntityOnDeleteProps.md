---
id: "EntityOnDeleteProps"
title: "Interface: EntityOnDeleteProps<M, UserType>"
sidebar_label: "EntityOnDeleteProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is deleted

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Properties

### collection

• **collection**: [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

collection of the entity being deleted

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:156](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L156)

___

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)

Context of the app status

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:176](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L176)

___

### entity

• **entity**: [`Entity`](Entity.md)\<`M`\>

Deleted entity

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:171](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L171)

___

### entityId

• **entityId**: `string`

Deleted entity id

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:166](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L166)

___

### path

• **path**: `string`

Path of the parent collection

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:161](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L161)

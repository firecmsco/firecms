---
id: "EntityIdUpdateProps"
title: "Interface: EntityIdUpdateProps<M>"
sidebar_label: "EntityIdUpdateProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is deleted

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### collection

• **collection**: [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

collection of the entity being deleted

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:188](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L188)

___

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)

Context of the app status

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:208](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L208)

___

### entityId

• `Optional` **entityId**: `string`

Current entity id

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:198](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L198)

___

### path

• **path**: `string`

Path of the parent collection

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:193](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L193)

___

### values

• **values**: `M`

Entity values

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:203](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L203)

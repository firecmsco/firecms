---
id: "EntityOnDeleteProps"
title: "Interface: EntityOnDeleteProps<M>"
sidebar_label: "EntityOnDeleteProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is deleted

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

## Properties

### context

• **context**: [`FireCMSContext`](FireCMSContext)<`any`\>

Context of the app status

#### Defined in

[models/entity_callbacks.ts:129](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L129)

___

### entity

• **entity**: [`Entity`](Entity)<`M`\>

Deleted entity

#### Defined in

[models/entity_callbacks.ts:124](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L124)

___

### entityId

• **entityId**: `string`

Deleted entity id

#### Defined in

[models/entity_callbacks.ts:119](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L119)

___

### path

• **path**: `string`

Path of the parent collection

#### Defined in

[models/entity_callbacks.ts:114](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L114)

___

### schema

• **schema**: [`ResolvedEntitySchema`](../types/ResolvedEntitySchema)<`M`\>

Schema of the entity being deleted

#### Defined in

[models/entity_callbacks.ts:109](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L109)

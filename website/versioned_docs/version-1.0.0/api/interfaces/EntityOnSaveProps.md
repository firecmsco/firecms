---
id: "EntityOnSaveProps"
title: "Interface: EntityOnSaveProps<M>"
sidebar_label: "EntityOnSaveProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is saved

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

## Properties

### context

• **context**: [`FireCMSContext`](FireCMSContext)<`any`\>

Context of the app status

#### Defined in

[models/entity_callbacks.ts:97](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L97)

___

### entityId

• `Optional` **entityId**: `string`

Id of the entity or undefined if new

#### Defined in

[models/entity_callbacks.ts:77](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L77)

___

### path

• **path**: `string`

Full path where this entity is being saved

#### Defined in

[models/entity_callbacks.ts:72](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L72)

___

### previousValues

• `Optional` **previousValues**: `Partial`<`M`\>

Previous values

#### Defined in

[models/entity_callbacks.ts:87](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L87)

___

### schema

• **schema**: [`ResolvedEntitySchema`](../types/ResolvedEntitySchema)<`M`\>

Resolved schema of the entity

#### Defined in

[models/entity_callbacks.ts:67](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L67)

___

### status

• **status**: [`EntityStatus`](../types/EntityStatus)

New or existing entity

#### Defined in

[models/entity_callbacks.ts:92](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L92)

___

### values

• **values**: `Partial`<`M`\>

Values being saved

#### Defined in

[models/entity_callbacks.ts:82](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entity_callbacks.ts#L82)

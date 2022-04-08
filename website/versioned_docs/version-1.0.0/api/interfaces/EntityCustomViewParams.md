---
id: "EntityCustomViewParams"
title: "Interface: EntityCustomViewParams<M>"
sidebar_label: "EntityCustomViewParams"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to the builder in charge of rendering a custom panel for
an entity view.

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` = `any` |

## Properties

### entity

• `Optional` **entity**: [`Entity`](Entity)<`M`\>

Entity that this view refers to. It can be undefined if the entity is new

#### Defined in

[models/entities.ts:191](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L191)

___

### modifiedValues

• `Optional` **modifiedValues**: `M`

Modified values in the form that have not been saved yet.
If the entity is not new and the values are not modified, these values
are the same as in `entity`

#### Defined in

[models/entities.ts:198](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L198)

___

### schema

• **schema**: [`ResolvedEntitySchema`](../types/ResolvedEntitySchema)<`M`\>

Schema used by this entity

#### Defined in

[models/entities.ts:186](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L186)

---
id: "FormContext"
title: "Interface: FormContext<M>"
sidebar_label: "FormContext"
sidebar_position: 0
custom_edit_url: null
---

Context passed to custom fields

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

## Properties

### entityId

• `Optional` **entityId**: `string`

Entity, it can be null if it's a new entity

#### Defined in

[models/fields.tsx:142](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L142)

___

### schema

• **schema**: [`ResolvedEntitySchema`](../types/ResolvedEntitySchema)<`M`\>

Schema of the entity being modified

#### Defined in

[models/fields.tsx:132](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L132)

___

### values

• **values**: `M`

Current values of the entity

#### Defined in

[models/fields.tsx:137](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L137)

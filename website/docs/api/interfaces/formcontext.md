---
id: "formcontext"
title: "Interface: FormContext<S, Key>"
sidebar_label: "FormContext"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### entityId

• `Optional` **entityId**: `string`

Entity, it can be null if it's a new entity

#### Defined in

[models/fields.tsx:124](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L124)

___

### entitySchema

• **entitySchema**: `S`

Schema of the entity being modified

#### Defined in

[models/fields.tsx:114](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L114)

___

### values

• **values**: [EntityValues](../types/entityvalues.md)<S, Key\>

Current values of the entity

#### Defined in

[models/fields.tsx:119](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L119)

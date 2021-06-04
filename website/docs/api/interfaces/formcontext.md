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

[models/fields.tsx:128](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L128)

___

### entitySchema

• **entitySchema**: `S`

Schema of the entity being modified

#### Defined in

[models/fields.tsx:118](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L118)

___

### values

• **values**: [EntityValues](../types/entityvalues.md)<S, Key\>

Current values of the entity

#### Defined in

[models/fields.tsx:123](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L123)

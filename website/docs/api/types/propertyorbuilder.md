---
id: "propertyorbuilder"
title: "Type alias: PropertyOrBuilder<S, Key, T>"
sidebar_label: "PropertyOrBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyOrBuilder**<S, Key, T\>: [Property](property.md)<T\> \| [PropertyBuilder](propertybuilder.md)<S, Key, T\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |
| `T` | `T`: `any` = `any` |

#### Defined in

[models/models.ts:524](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L524)

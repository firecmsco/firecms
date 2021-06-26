---
id: "propertyorbuilder"
title: "Type alias: PropertyOrBuilder<T, S, Key>"
sidebar_label: "PropertyOrBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyOrBuilder**<T, S, Key\>: [Property](property.md)<T\> \| [PropertyBuilder](propertybuilder.md)<T, S, Key\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](cmstype.md) = [CMSType](cmstype.md) |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Defined in

[models/properties.ts:153](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L153)

---
id: "propertiesorbuilder"
title: "Type alias: PropertiesOrBuilder<S, Key>"
sidebar_label: "PropertiesOrBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertiesOrBuilder**<S, Key\>: `Record`<Key, [PropertyOrBuilder](propertyorbuilder.md)<[CMSType](cmstype.md), S, Key\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Defined in

[models/properties.ts:157](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L157)

---
id: "propertiesorbuilder"
title: "Type alias: PropertiesOrBuilder<S, Key, T>"
sidebar_label: "PropertiesOrBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertiesOrBuilder**<S, Key, T\>: `Record`<Key, [PropertyOrBuilder](propertyorbuilder.md)<S, Key, T\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |
| `T` | `T`: `any` = `any` |

#### Defined in

[models/models.ts:528](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L528)

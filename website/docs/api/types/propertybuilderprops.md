---
id: "propertybuilderprops"
title: "Type alias: PropertyBuilderProps<S, Key>"
sidebar_label: "PropertyBuilderProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyBuilderProps**<S, Key\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `entityId?` | `string` |
| `values` | `Partial`<[EntityValues](entityvalues.md)<S, Key\>\> |

#### Defined in

[models/properties.ts:146](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L146)

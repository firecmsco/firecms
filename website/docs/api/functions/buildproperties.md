---
id: "buildproperties"
title: "Function: buildProperties"
sidebar_label: "buildProperties"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildProperties**<Key\>(`properties`): [Properties](../types/properties.md)<Key\>

Identity function we use to defeat the type system of Typescript and preserve
the properties keys. It can be useful if you have entity schemas with the
same properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | `Key`: `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [Properties](../types/properties.md)<Key\> |

#### Returns

[Properties](../types/properties.md)<Key\>

#### Defined in

[models/builders.ts:97](https://github.com/Camberi/firecms/blob/b1328ad/src/models/builders.ts#L97)

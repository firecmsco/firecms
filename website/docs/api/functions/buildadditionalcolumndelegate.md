---
id: "buildadditionalcolumndelegate"
title: "Function: buildAdditionalColumnDelegate"
sidebar_label: "buildAdditionalColumnDelegate"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildAdditionalColumnDelegate**<AdditionalKey, S, Key\>(`additionalColumnDelegate`): [AdditionalColumnDelegate](../interfaces/additionalcolumndelegate.md)<AdditionalKey, S, Key\>

Identity function we use to defeat the type system of Typescript and build
additional column delegates views with all its properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `AdditionalKey` | `AdditionalKey`: `string` = `string` |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalColumnDelegate` | [AdditionalColumnDelegate](../interfaces/additionalcolumndelegate.md)<AdditionalKey, S, Key\> |

#### Returns

[AdditionalColumnDelegate](../interfaces/additionalcolumndelegate.md)<AdditionalKey, S, Key\>

#### Defined in

[models/builders.ts:120](https://github.com/Camberi/firecms/blob/b1328ad/src/models/builders.ts#L120)

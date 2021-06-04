---
id: "buildschema"
title: "Function: buildSchema"
sidebar_label: "buildSchema"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildSchema**<Key\>(`schema`): [EntitySchema](../interfaces/entityschema.md)<Key\>

Identity function we use to defeat the type system of Typescript and preserve
the schema keys

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | `Key`: `string` = `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [EntitySchema](../interfaces/entityschema.md)<Key\> |

#### Returns

[EntitySchema](../interfaces/entityschema.md)<Key\>

#### Defined in

[models/builders.ts:54](https://github.com/Camberi/firecms/blob/42dd384/src/models/builders.ts#L54)

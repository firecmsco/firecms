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

[models/builders.ts:58](https://github.com/Camberi/firecms/blob/b1328ad/src/models/builders.ts#L58)

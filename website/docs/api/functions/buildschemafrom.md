---
id: "buildschemafrom"
title: "Function: buildSchemaFrom"
sidebar_label: "buildSchemaFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildSchemaFrom**<Type, Key, T\>(`schema`): [EntitySchema](../interfaces/entityschema.md)<Key, T\>

Identity function that requires a builds a schema based on a type.
Useful if you have defined your models in Typescript.
The schema property keys are validated by the type system but the property
data types are not yet, so you could still match a string type to a
NumberProperty, e.g.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | `Type`: `Partial`<{ [P in string]: T}\> |
| `Key` | `Key`: `string` = `Extract`<keyof `Type`, string\> |
| `T` | `T` = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [EntitySchema](../interfaces/entityschema.md)<Key, T\> |

#### Returns

[EntitySchema](../interfaces/entityschema.md)<Key, T\>

#### Defined in

[models/builders.ts:68](https://github.com/Camberi/firecms/blob/42dd384/src/models/builders.ts#L68)

---
id: "buildschemafrom"
title: "Function: buildSchemaFrom"
sidebar_label: "buildSchemaFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildSchemaFrom**<Type, Key, T\>(`schema`): [EntitySchema](../interfaces/entityschema.md)<Key\>

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
| `T` | `T`: [CMSType](../types/cmstype.md) = [CMSType](../types/cmstype.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [EntitySchema](../interfaces/entityschema.md)<Key\> |

#### Returns

[EntitySchema](../interfaces/entityschema.md)<Key\>

#### Defined in

[models/builders.ts:72](https://github.com/Camberi/firecms/blob/b1328ad/src/models/builders.ts#L72)

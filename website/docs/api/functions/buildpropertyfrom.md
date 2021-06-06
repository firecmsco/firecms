---
id: "buildpropertyfrom"
title: "Function: buildPropertyFrom"
sidebar_label: "buildPropertyFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildPropertyFrom**<S, Key, T\>(`propertyOrBuilder`, `values`, `entityId?`): [Property](../types/property.md)<T\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> |
| `Key` | `Key`: `string` |
| `T` | `T`: `unknown` = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyOrBuilder` | [PropertyOrBuilder](../types/propertyorbuilder.md)<S, Key, T\> |
| `values` | `Partial`<[EntityValues](../types/entityvalues.md)<S, Key\>\> |
| `entityId?` | `string` |

#### Returns

[Property](../types/property.md)<T\>

#### Defined in

[models/builders.ts:13](https://github.com/Camberi/firecms/blob/42dd384/src/models/builders.ts#L13)

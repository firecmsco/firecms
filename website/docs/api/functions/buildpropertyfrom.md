---
id: "buildpropertyfrom"
title: "Function: buildPropertyFrom"
sidebar_label: "buildPropertyFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildPropertyFrom**<T, S, Key\>(`propertyOrBuilder`, `values`, `entityId?`): [Property](../types/property.md)<T\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](../types/cmstype.md) |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> |
| `Key` | `Key`: `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyOrBuilder` | [PropertyOrBuilder](../types/propertyorbuilder.md)<T, S, Key\> |
| `values` | `Partial`<[EntityValues](../types/entityvalues.md)<S, Key\>\> |
| `entityId?` | `string` |

#### Returns

[Property](../types/property.md)<T\>

#### Defined in

[models/builders.ts:17](https://github.com/Camberi/firecms/blob/b1328ad/src/models/builders.ts#L17)
